import React from "react";
import _ from "lodash";
import { InitParams } from "@3dbionotes/pdbe-molstar/lib/spec";
import { PDBeMolstarPlugin } from "@3dbionotes/pdbe-molstar/lib";

import { debugVariable } from "../../../utils/debug";
import i18n from "../../utils/i18n";
import {
    DbItem,
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
import { getLigands, loadEmdb } from "./molstar";
import { Ligand } from "../../../domain/entities/Ligand";
import { PdbInfo } from "../../../domain/entities/PdbInfo";
import { Maybe } from "../../../utils/ts-utils";
import { useBooleanState } from "../../hooks/use-boolean";
import { LoaderMask } from "../loader-mask/LoaderMask";

declare global {
    interface Window {
        PDBeMolstarPlugin: typeof PDBeMolstarPlugin;
    }
}

interface MolecularStructureProps {
    pdbInfo: Maybe<PdbInfo>;
    selection: Selection;
    onSelectionChange(newSelection: Selection): void;
    onLigandsLoaded(ligands: Ligand[]): void;
}

export const MolecularStructure: React.FC<MolecularStructureProps> = props => {
    const { pluginRef, isLoading } = usePdbePlugin(props);

    return (
        <React.Fragment>
            <LoaderMask open={isLoading} />

            <div ref={pluginRef} className="molecular-structure">
                {i18n.t("Loading...")}
            </div>
        </React.Fragment>
    );
};

function usePdbePlugin(options: MolecularStructureProps) {
    const { selection: newSelection, onSelectionChange: setSelection, onLigandsLoaded } = options;
    const { compositionRoot } = useAppContext();
    const [pdbePlugin, setPdbePlugin] = React.useState<PDBeMolstarPlugin>();
    const [pluginLoad, setPluginLoad] = React.useState<Date>();
    const [isLoading, { enable: showLoading, disable: hideLoading }] = useBooleanState(false);

    // Keep a reference containing the previous value of selection. We need this value to diff
    // the new state against the old state and perform imperative operations (add/remove/update)
    // on the plugin.
    const [prevSelectionRef, setPrevSelection] = useReference<Selection>();

    React.useEffect(() => {
        if (!pluginLoad || !pdbePlugin) return;
        const ligands = getLigands(pdbePlugin, newSelection) || [];
        debugVariable({ ligands });
        onLigandsLoaded(ligands);

        setVisibilityForSelection(pdbePlugin, newSelection);
        highlight(pdbePlugin, newSelection);
    }, [pluginLoad, pdbePlugin, onLigandsLoaded, newSelection]);

    const pluginRef = React.useCallback(
        async (element: HTMLDivElement | null) => {
            if (!element || !newSelection.main) return;
            const currentSelection = prevSelectionRef.current;
            const pluginAlreadyRendered = Boolean(pdbePlugin);
            const ligandChanged =
                currentSelection && currentSelection.ligandId !== newSelection.ligandId;

            if (!ligandChanged && pluginAlreadyRendered) return;

            const plugin = pdbePlugin || new window.PDBeMolstarPlugin();
            const initParams = getPdbePluginInitParams(plugin, newSelection);
            debugVariable({ pdbeMolstar: plugin });

            // To subscribe to the load event: plugin.events.loadComplete.subscribe(loaded => { ... });
            if (pluginAlreadyRendered) {
                showLoading();
                await plugin.visual.update(initParams);
            } else {
                plugin.events.loadComplete.subscribe(loaded => {
                    console.debug("molstar.events.loadComplete", loaded);
                    hideLoading();
                    if (loaded) setPluginLoad(new Date());
                });

                plugin.render(element, initParams);
            }

            const emdbId = getMainEmdbId(newSelection);
            if (emdbId) {
                showLoading();
                loadEmdb(plugin, emdbId);
            }

            setPdbePlugin(plugin);
            setPrevSelection({ ...newSelection, overlay: [] });
        },
        [pdbePlugin, newSelection, setPrevSelection, prevSelectionRef, showLoading, hideLoading]
    );

    const updatePluginOnNewSelection = React.useCallback(() => {
        function updateSelection(currentSelection: Selection, newSelection: Selection): void {
            if (!pdbePlugin) return;

            applySelectionChangesToPlugin(pdbePlugin, currentSelection, newSelection, showLoading);
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
        showLoading,
    ]);

    const updatePluginOnNewSelectionEffect = useCallbackEffect(updatePluginOnNewSelection);
    React.useEffect(updatePluginOnNewSelectionEffect, [updatePluginOnNewSelectionEffect]);

    return { pluginRef, pdbePlugin, isLoading };
}

function setVisibilityForSelection(plugin: PDBeMolstarPlugin, selection: Selection) {
    getItems(selection).forEach(item => setVisibility(plugin, item));
}

function setVisibility(plugin: PDBeMolstarPlugin, item: DbItem) {
    const selector = getItemSelector(item);
    return plugin.visual.setVisibility(selector, item.visible);
}

async function applySelectionChangesToPlugin(
    plugin: PDBeMolstarPlugin,
    currentSelection: Selection,
    newSelection: Selection,
    showLoading: () => void
): Promise<void> {
    const oldItems = getItems(currentSelection);
    const newItems = getItems(newSelection);

    const { added, removed, updated } = diffDbItems(newItems, oldItems);

    for (const item of removed) {
        plugin.visual.remove(getItemSelector(item));
    }

    for (const item of updated) {
        setVisibility(plugin, item);
    }

    for (const item of added) {
        if (item.type === "emdb") {
            showLoading();
            loadEmdb(plugin, item.id);
        } else {
            const pdbId: string = item.id;
            const url = `https://www.ebi.ac.uk/pdbe/model-server/v1/${pdbId}/full?encoding=cif`;
            const loadParams = { url, format: "mmcif", isBinary: false, assemblyId: "1" };
            showLoading();
            await plugin.load(loadParams, false);
        }
        setVisibility(plugin, item);
    }

    if (newSelection.chainId !== currentSelection.chainId) {
        highlight(plugin, newSelection);
    }

    plugin.visual.reset({ camera: true });
}

async function highlight(plugin: PDBeMolstarPlugin, selection: Selection): Promise<void> {
    plugin.visual.clearSelection().catch(_err => {});

    const ligandsView = getLigandView(selection);
    if (ligandsView) return;

    /*
    return plugin.visual.select({
        data: [
            {
                struct_asym_id: selection.chainId,
                color: "#9B9BBE",
                focus: true,
            },
        ],
        nonSelectedColor: { r: 255, g: 255, b: 255 },
    });
    */
}

const colors = {
    black: { r: 0, g: 0, b: 0 },
    white: { r: 255, g: 255, b: 255 },
};

type LigandView = InitParams["ligandView"];

function getPdbePluginInitParams(_plugin: PDBeMolstarPlugin, newSelection: Selection): InitParams {
    const pdbId = getMainPdbId(newSelection);
    const ligandView = getLigandView(newSelection);

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
        ligandView,
        mapSettings: {},
    };
}

function getLigandView(selection: Selection): LigandView | undefined {
    const { chainId, ligandId } = selection;
    if (!chainId || !ligandId) return;
    const [component, position] = ligandId.split("-");
    if (!component || !position) return;

    return {
        auth_asym_id: chainId + "_1",
        auth_seq_id: parseInt(position),
        label_comp_id: component,
    };
}
