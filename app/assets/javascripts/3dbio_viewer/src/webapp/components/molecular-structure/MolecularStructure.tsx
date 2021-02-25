import React from "react";
import _ from "lodash";
import { InitParams } from "@3dbionotes/pdbe-molstar/lib/spec";
import { PDBeMolstarPlugin } from "@3dbionotes/pdbe-molstar/lib";

import { debugVariable } from "../../../utils/debug";
import i18n from "../../utils/i18n";
import { DbItem, diffDbItems, getItems, SelectionState } from "../../view-models/SelectionState";

import "./molstar.css";
import "./molstar.scss";
import { useReference } from "../../hooks/use-reference";

declare global {
    interface Window {
        PDBeMolstarPlugin: typeof PDBeMolstarPlugin;
    }
}

interface MolecularStructureProps {
    selection: SelectionState;
}

export const MolecularStructure: React.FC<MolecularStructureProps> = props => {
    const { pluginRef } = usePdbePlugin(props.selection);

    return (
        <div ref={pluginRef} className="molecular-structure">
            {i18n.t("Loading...")}
        </div>
    );
};

function usePdbePlugin(newSelection: SelectionState) {
    const [pdbePlugin, setPdbePlugin] = React.useState<PDBeMolstarPlugin>();
    const [selection, setSelection] = useReference<SelectionState>();

    const pluginRef = React.useCallback(
        (element: HTMLDivElement | null) => {
            const pluginAlreadyRendered = Boolean(pdbePlugin);
            if (!element || pluginAlreadyRendered || !newSelection || !newSelection.main) return;

            const initParams = getPdbePluginInitParams(newSelection.main.pdb.id);
            const plugin = new window.PDBeMolstarPlugin();
            debugVariable({ pdbeMolstar: plugin });

            plugin.render(element, initParams);
            setPdbePlugin(plugin);
            setSelection({ ...newSelection, overlay: [] });
        },
        [pdbePlugin, newSelection, setSelection]
    );

    React.useEffect(() => {
        async function load(plugin: PDBeMolstarPlugin, oldItems: DbItem[], newItems: DbItem[]) {
            const { added, removed, updated } = diffDbItems(newItems, oldItems);

            for (const item of added) {
                if (item.type !== "pdb") continue;
                const itemId: string = item.id;

                const url = `https://www.ebi.ac.uk/pdbe/model-server/v1/${itemId}/full?encoding=cif`;
                const reload = false;
                await plugin.load(
                    {
                        url,
                        format: "mmcif",
                        isBinary: false,
                        assemblyId: "1", // TODO
                    },
                    reload
                );

                plugin.visual.setVisibility(item.id.toUpperCase(), item.visible);
            }

            for (const item of removed) {
                plugin.visual.remove(item.id.toUpperCase());
            }

            for (const item of updated) {
                plugin.visual.setVisibility(item.id.toUpperCase(), item.visible);
            }

            setSelection(newSelection);
        }

        if (pdbePlugin) {
            load(pdbePlugin, getItems(selection), getItems(newSelection));
        }
    }, [pdbePlugin, newSelection, selection, setSelection]);

    return { pluginRef };
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
