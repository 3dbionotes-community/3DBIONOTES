import React from "react";
import _ from "lodash";
import { InitParams } from "@3dbionotes/pdbe-molstar/lib/spec";
import { PDBeMolstarPlugin } from "@3dbionotes/pdbe-molstar/lib";
import { EmdbDownloadProvider } from "molstar/lib/mol-plugin-state/actions/volume";

import { debugVariable } from "../../../utils/debug";
import i18n from "../../utils/i18n";
import {
    DbItem,
    diffDbItems,
    getItems,
    getItemSelector,
    Selection,
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

const emdbProvider: EmdbDownloadProvider = "rcsb"; // "pdbe" server not working at this moment

export const MolecularStructure: React.FC<MolecularStructureProps> = props => {
    const { pluginRef } = usePdbePlugin(props.selection);

    return (
        <div ref={pluginRef} className="molecular-structure">
            {i18n.t("Loading...")}
        </div>
    );
};

function usePdbePlugin(newSelection: Selection) {
    const [pdbePlugin, setPdbePlugin] = React.useState<PDBeMolstarPlugin>();

    // Keep a reference with the previous value of selection, so we can diff with a new
    // state and perform the imperative add/remove/update operations.
    const [prevSelectionRef, setPrevSelection] = useReference<Selection>();

    const pluginRef = React.useCallback(
        (element: HTMLDivElement | null) => {
            const pluginAlreadyRendered = Boolean(pdbePlugin);
            if (!element || pluginAlreadyRendered || !newSelection || !newSelection.main) return;

            const initParams = getPdbePluginInitParams(newSelection.main.pdb?.id);
            const plugin = new window.PDBeMolstarPlugin();
            debugVariable({ pdbeMolstar: plugin });

            // Subscribe event: plugin.events.loadComplete.subscribe(loaded => { ... });
            plugin.render(element, initParams);

            const emdbId = newSelection.main.emdb?.id;
            if (emdbId) plugin.loadEmdb({ id: emdbId, detail: 3, provider: emdbProvider });

            setPdbePlugin(plugin);
            setPrevSelection({ ...newSelection, overlay: [] });
        },
        [pdbePlugin, newSelection, setPrevSelection]
    );

    React.useEffect(() => {
        async function load(plugin: PDBeMolstarPlugin, oldItems: DbItem[], newItems: DbItem[]) {
            const { added, removed, updated } = diffDbItems(newItems, oldItems);

            setPrevSelection(newSelection);

            for (const item of removed) {
                plugin.visual.remove(getItemSelector(item));
            }

            for (const item of updated) {
                plugin.visual.setVisibility(getItemSelector(item), item.visible);
            }

            for (const item of added) {
                if (item.type === "emdb") {
                    plugin.loadEmdb({ id: item.id, detail: 3, provider: emdbProvider });
                    plugin.visual.setVisibility(getItemSelector(item), item.visible);
                } else {
                    const pdbId: string = item.id;
                    const url = `https://www.ebi.ac.uk/pdbe/model-server/v1/${pdbId}/full?encoding=cif`;

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
            }

            plugin.visual.reset({ camera: true });
        }

        if (pdbePlugin) {
            load(pdbePlugin, getItems(prevSelectionRef.current), getItems(newSelection));
        }
    }, [pdbePlugin, newSelection, prevSelectionRef, setPrevSelection]);

    return { pluginRef };
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
        assemblyId: "1",
        mapSettings: {},
    };
}
