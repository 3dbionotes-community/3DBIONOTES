import React from "react";
import _ from "lodash";
import { InitParams } from "@3dbionotes/pdbe-molstar/lib/spec";
import { PDBeMolstarPlugin } from "@3dbionotes/pdbe-molstar/lib";
import { EmdbDownloadProvider } from "molstar/lib/mol-plugin-state/actions/volume";

import { debugVariable } from "../../../utils/debug";
import i18n from "../../utils/i18n";
import {
    diffDbItems,
    getItems,
    getItemSelector,
    getMainChanges,
    getMainEmdbId,
    getMainPdbId,
    Selection,
    setMainEmdb,
    setMainPdb,
} from "../../view-models/Selection";

import "./molstar.css";
import "./molstar.scss";
import { useReference } from "../../hooks/use-reference";
import { useAppContext } from "../AppContext";
import { useCallbackEffect } from "../../hooks/use-callback-effect";
import { getLigands } from "./molstar";
import { Ligand } from "../../../domain/entities/Ligand";

declare global {
    interface Window {
        PDBeMolstarPlugin: typeof PDBeMolstarPlugin;
    }
}

interface MolecularStructureProps {
    selection: Selection;
    onSelectionChange(newSelection: Selection): void;
    onLigandsLoaded(ligands: Ligand[]): void;
}

const emdbProvider: EmdbDownloadProvider = "rcsb"; // "pdbe" server not working at this moment

export const MolecularStructure: React.FC<MolecularStructureProps> = props => {
    const { pluginRef } = usePdbePlugin(props);

    return (
        <div ref={pluginRef} className="molecular-structure">
            {i18n.t("Loading...")}
        </div>
    );
};

function usePdbePlugin(options: MolecularStructureProps) {
    const { selection: newSelection, onSelectionChange: setSelection, onLigandsLoaded } = options;
    const { compositionRoot } = useAppContext();
    const [pdbePlugin, setPdbePlugin] = React.useState<PDBeMolstarPlugin>();

    // Keep a reference containing the previous value of selection. We need this value to diff
    // the new state against the old state and perform imperative operations (add/remove/update)
    // on the plugin.
    const [prevSelectionRef, setPrevSelection] = useReference<Selection>();

    const pluginRef = React.useCallback(
        (element: HTMLDivElement | null) => {
            const pluginAlreadyRendered = Boolean(pdbePlugin);
            if (!element || pluginAlreadyRendered || !newSelection || !newSelection.main) return;

            const initParams = getPdbePluginInitParams(getMainPdbId(newSelection));
            const plugin = new window.PDBeMolstarPlugin();
            debugVariable({ pdbeMolstar: plugin });

            // To subscribe to the load event: plugin.events.loadComplete.subscribe(loaded => { ... });
            plugin.events.loadComplete.subscribe(loaded => {
                if (!loaded) return;
                const ligands = getLigands(plugin, newSelection) || [];
                onLigandsLoaded(ligands);
            });
            plugin.render(element, initParams);

            const emdbId = getMainEmdbId(newSelection);
            if (emdbId) plugin.loadEmdb({ id: emdbId, detail: 3, provider: emdbProvider });

            setPdbePlugin(plugin);
            setPrevSelection({ ...newSelection, overlay: [] });
        },
        [pdbePlugin, newSelection, setPrevSelection, onLigandsLoaded]
    );

    const updatePluginOnNewSelection = React.useCallback(() => {
        function updateSelection(currentSelection: Selection, newSelection: Selection): void {
            if (!pdbePlugin) return;

            applySelectionChangesToPlugin(pdbePlugin, currentSelection, newSelection);
            setPrevSelection(newSelection);
            setSelection(newSelection);
        }

        const currentSelection = prevSelectionRef.current;
        if (!(pdbePlugin && currentSelection)) return _.noop;

        const { pdbId, emdbId } = getMainChanges(currentSelection, newSelection);

        if (pdbId) {
            return compositionRoot.getRelatedModels.emdbFromPdb(pdbId).run(emdbId => {
                updateSelection(currentSelection, setMainEmdb(newSelection, emdbId));
            }, console.error);
        } else if (emdbId) {
            return compositionRoot.getRelatedModels.pdbFromEmdb(emdbId).run(pdbId => {
                updateSelection(currentSelection, setMainPdb(newSelection, pdbId));
            }, console.error);
        } else {
            updateSelection(currentSelection, newSelection);
            return _.noop;
        }
    }, [
        compositionRoot,
        pdbePlugin,
        newSelection,
        prevSelectionRef,
        setPrevSelection,
        setSelection,
    ]);

    const updatePluginOnNewSelectionEffect = useCallbackEffect(updatePluginOnNewSelection);
    React.useEffect(updatePluginOnNewSelectionEffect, [updatePluginOnNewSelectionEffect]);

    return { pluginRef };
}

async function applySelectionChangesToPlugin(
    plugin: PDBeMolstarPlugin,
    currentSelection: Selection,
    newSelection: Selection
): Promise<void> {
    const oldItems = getItems(currentSelection);
    const newItems = getItems(newSelection);

    const { added, removed, updated } = diffDbItems(newItems, oldItems);

    for (const item of removed) {
        plugin.visual.remove(getItemSelector(item));
    }

    for (const item of updated) {
        plugin.visual.setVisibility(getItemSelector(item), item.visible);
    }

    for (const item of added) {
        if (item.type === "emdb") {
            await plugin.loadEmdb({ id: item.id, detail: 3, provider: emdbProvider });
        } else {
            const pdbId: string = item.id;
            const url = `https://www.ebi.ac.uk/pdbe/model-server/v1/${pdbId}/full?encoding=cif`;
            const loadParams = { url, format: "mmcif", isBinary: false, assemblyId: "1" };
            await plugin.load(loadParams, false);
        }
        plugin.visual.setVisibility(getItemSelector(item), item.visible);
    }

    plugin.visual.reset({ camera: true });
}

function getPdbePluginInitParams(pdbId: string | undefined): InitParams {
    const colors = {
        black: { r: 0, g: 0, b: 0 },
        white: { r: 255, g: 255, b: 255 },
    };

    return {
        moleculeId: pdbId,
        pdbeUrl: "https://www.ebi.ac.uk/pdbe/",
        encoding: "cif",
        loadMaps: false,
        validationAnnotation: true,
        hideControls: false,
        superposition: false,
        domainAnnotation: true,
        expanded: false,
        bgColor: colors.white,
        subscribeEvents: true,
        assemblyId: "1", // For assembly type? Check model type-
        mapSettings: {},
    };
}
