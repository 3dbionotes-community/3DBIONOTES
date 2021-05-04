import React from "react";
import _ from "lodash";
import { InitParams } from "@3dbionotes/pdbe-molstar/lib/spec";
import { PDBeMolstarPlugin, Selector } from "@3dbionotes/pdbe-molstar/lib";

import { debugVariable } from "../../../utils/debug";
import i18n from "../../utils/i18n";
import {
    DbItem,
    diffDbItems,
    getItems,
    Selection,
    setMainEmdb,
} from "../../view-models/Selection";

import "./molstar.css";
import "./molstar.scss";
import { useReference } from "../../hooks/use-reference";

declare global {
    interface Window {
        PDBeMolstarPlugin: typeof PDBeMolstarPlugin;
    }
}

interface MolecularStructureProps {
    selection: Selection;
    onSelectionChange(newSelection: Selection): void;
}

export const MolecularStructure: React.FC<MolecularStructureProps> = props => {
    const { pluginRef } = usePdbePlugin(props.selection, props.onSelectionChange);

    return (
        <div ref={pluginRef} className="molecular-structure">
            {i18n.t("Loading...")}
        </div>
    );
};

function usePdbePlugin(
    newSelection: Selection,
    onSelectionChange: (newSelection: Selection) => void
) {
    const [pdbePlugin, setPdbePlugin] = React.useState<PDBeMolstarPlugin>();

    // Keep a reference with the previous value of selection, so we can diff with a new
    // state and perform the imperative add/remove/update operations.
    const [prevSelectionRef, setPrevSelection] = useReference<Selection>();

    const setEmdbFromLoadEvent = React.useCallback(
        (plugin: PDBeMolstarPlugin, loaded) => {
            const selection = prevSelectionRef.current;
            const emdbId = plugin.visual.getMapVolume();
            if (!loaded || !emdbId || !selection || selection.main?.emdb?.id === emdbId) return;
            const newEmdbSelection = setMainEmdb(selection, emdbId);
            setPrevSelection(newEmdbSelection);
            onSelectionChange(newEmdbSelection);
            const emdbItem = newEmdbSelection.main?.emdb;
            if (emdbItem) plugin.visual.setVisibility(getItemSelector(emdbItem), emdbItem.visible);
        },
        [prevSelectionRef, setPrevSelection, onSelectionChange]
    );

    const pluginRef = React.useCallback(
        (element: HTMLDivElement | null) => {
            const pluginAlreadyRendered = Boolean(pdbePlugin);
            if (!element || pluginAlreadyRendered || !newSelection || !newSelection.main) return;

            const initParams = getPdbePluginInitParams(newSelection.main.pdb.id);
            const plugin = new window.PDBeMolstarPlugin();
            debugVariable({ pdbeMolstar: plugin });

            plugin.events.loadComplete.subscribe(loaded => setEmdbFromLoadEvent(plugin, loaded));
            plugin.render(element, initParams);

            setPdbePlugin(plugin);
            setPrevSelection({ ...newSelection, overlay: [] });
        },
        [pdbePlugin, newSelection, setPrevSelection, setEmdbFromLoadEvent]
    );

    React.useEffect(() => {
        async function load(plugin: PDBeMolstarPlugin, oldItems: DbItem[], newItems: DbItem[]) {
            const { added, removed, updated } = diffDbItems(newItems, oldItems);

            for (const item of added) {
                if (item.type !== "pdb") continue;
                const itemId: string = item.id;

                const url = `https://www.ebi.ac.uk/pdbe/model-server/v1/${itemId}/full?encoding=cif`;
                await plugin.load(
                    {
                        url,
                        format: "mmcif",
                        isBinary: false,
                        assemblyId: "1", // TODO
                    },
                    false
                );

                plugin.visual.setVisibility(getItemSelector(item), item.visible);
            }

            for (const item of removed) {
                plugin.visual.remove(getItemSelector(item));
            }

            for (const item of updated) {
                plugin.visual.setVisibility(getItemSelector(item), item.visible);
            }

            plugin.visual.reset({ camera: true });

            setPrevSelection(newSelection);
        }

        if (pdbePlugin) {
            load(pdbePlugin, getItems(prevSelectionRef.current), getItems(newSelection));
        }
    }, [pdbePlugin, newSelection, prevSelectionRef, setPrevSelection]);

    return { pluginRef };
}

function getItemSelector(item: DbItem): Selector {
    switch (item.type) {
        case "pdb":
            return { label: item.id.toUpperCase() };
        case "emdb":
            return { description: item.id.toUpperCase() };
    }
}

function getPdbePluginInitParams(pdbId: string): InitParams {
    const colors = {
        black: { r: 0, g: 0, b: 0 },
        white: { r: 255, g: 255, b: 255 },
    };

    return {
        moleculeId: pdbId,
        pdbeUrl: "https://www.ebi.ac.uk/pdbe/",
        encoding: "cif",
        loadMaps: true,
        validationAnnotation: true,
        hideControls: false,
        superposition: false,
        domainAnnotation: true,
        expanded: false,
        bgColor: colors.white,
        subscribeEvents: true,
        assemblyId: "1",
        mapSettings: {},
    };
}
