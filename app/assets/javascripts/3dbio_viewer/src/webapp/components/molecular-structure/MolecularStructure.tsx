import React from "react";
import { InitParams } from "@3dbionotes/pdbe-molstar/lib/spec";
import { debugVariable } from "../../../utils/debug";
import { LoadParams } from "@3dbionotes/pdbe-molstar/lib/helpers";

import "./molstar.css";
import "./molstar.scss";
import i18n from "../../utils/i18n";
import { SelectionState } from "../../view-models/SelectionState";

import { StateTransform } from "molstar/lib/mol-state";
import { StateSelection } from "molstar/lib/mol-state";
import { PluginCommands } from "molstar/lib/mol-plugin/commands";
//import { PluginContext } from "molstar/lib/mol-plugin/context";
//import { PDBeMolstarPlugin } from "@3dbionotes/pdbe-molstar/lib";

/*
declare global {
    interface Window {
        PDBeMolstarPlugin: PDBeMolstarPlugin;
    }
}
*/

declare const PDBeMolstarPlugin: {
    new (): PDBeMolstarPluginInstance;
};

//declare class PDBeMolstarPlugin;

type PDBeMolstarPluginInstance = any;

/*
declare class PDBeMolstarPlugin {
    render(el: HTMLElement, initParams: InitParams): void;
    load(loadParams: LoadParams, fullLoad: boolean): void;
    plugin: PluginContext;
    state: any;
}
*/

interface MolecularStructureProps {
    selection: SelectionState;
}

export const MolecularStructure: React.FC<MolecularStructureProps> = props => {
    const { selection } = props;
    //const inputEl = React.useRef<HTMLDivElement>(null);
    const [plugin, setPlugin] = React.useState<PDBeMolstarPluginInstance>();

    const inputEl = React.useCallback(
        (el: HTMLDivElement) => {
            if (!el) return;

            const initParams: InitParams = {
                moleculeId: selection.main.pdbId,
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

            const plugin = new PDBeMolstarPlugin();
            plugin.render(el, initParams);
            setPlugin(plugin);

            debugVariable({ pdbeMolstar: plugin });
        },
        [selection.main.pdbId]
    );

    /*
    React.useEffect(() => {
        const el = inputEl.current;
        if (!el) return;

        const initParams: InitParams = {
            //moleculeId: selection.main.pdbId,
            //pdbeUrl: "https://www.ebi.ac.uk/pdbe/",
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

        plugin.render(el, initParams);
        debugVariable({ pdbeMolstar: plugin });
    }, []);
    */

    React.useEffect(() => {
        if (!plugin) return;

        selection.overlay
            .filter(item => item.type === "pdb")
            .forEach(item => {
                console.log("load plugin", item);

                plugin.load(
                    {
                        url: `https://www.ebi.ac.uk/pdbe/model-server/v1/${item.id.toString()}/full?encoding=cif`,
                        format: "mmcif",
                        isBinary: false,
                        assemblyId: "1", // TODO
                    },
                    false
                );
                console.log("load plugin-post");
            });
    }, [plugin, selection.overlay]);

    return (
        <div ref={inputEl} className="molecular-structure">
            {i18n.t("Loading...")}
        </div>
    );
};

const colors = {
    black: { r: 0, g: 0, b: 0 },
    white: { r: 255, g: 255, b: 255 },
};

function visibility(
    pdbePlugin: PDBeMolstarPluginInstance,
    data: {
        polymer?: boolean;
        het?: boolean;
        water?: boolean;
        carbs?: boolean;
        maps?: boolean;
        [key: string]: any;
    }
) {
    if (!data) return;
    const plugin = pdbePlugin.plugin;

    const refMap: any = {
        polymer: "structure-component-static-polymer",
        het: "structure-component-static-ligand",
        water: "structure-component-static-water",
        carbs: "structure-component-static-branched",
        maps: "volume-streaming-info",
    };

    for (const visual in data) {
        const tagName = refMap[visual];
        console.log({ data, tagName });
        const componentRef = StateSelection.findTagInSubtree(
            plugin.state.data.tree,
            StateTransform.RootRef,
            tagName
        );
        if (componentRef) {
            const compVisual = plugin.state.data.select(componentRef)[0];
            if (compVisual && compVisual.obj) {
                const currentlyVisible =
                    compVisual.state && compVisual.state.isHidden ? false : true;
                if (data[visual] !== currentlyVisible) {
                    console.log("visilbity", { ref: componentRef, state: plugin.state });
                    PluginCommands.State.ToggleVisibility(plugin, {
                        state: plugin.state,
                        ref: componentRef,
                    });
                }
            }
        }
    }
}

// debugVariable({ visibility });
