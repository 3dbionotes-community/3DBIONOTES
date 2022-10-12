import React from "react";
import _ from "lodash";
import { InitParams } from "@3dbionotes/pdbe-molstar/lib/spec";
import { PDBeMolstarPlugin } from "@3dbionotes/pdbe-molstar/lib";

import { debugVariable } from "../../../utils/debug";
import i18n from "../../utils/i18n";
import {
    DbItem,
    diffDbItems,
    emptySelection,
    getItems,
    getItemSelector,
    getMainChanges,
    getMainPdbId,
    Selection,
    setMainEmdb,
    setMainPdb,
} from "../../view-models/Selection";

import "./molstar.css";
import "./molstar-light.css";
import { useReference } from "../../hooks/use-reference";
import { useAppContext } from "../AppContext";
import { useCallbackEffect } from "../../hooks/use-callback-effect";
import { getLigands, loadEmdb, setEmdbOpacity } from "./molstar";
import { Ligand } from "../../../domain/entities/Ligand";
import { PdbInfo } from "../../../domain/entities/PdbInfo";
import { Maybe } from "../../../utils/ts-utils";
import { useBooleanState } from "../../hooks/use-boolean";
import { LoaderMask } from "../loader-mask/LoaderMask";
import { routes } from "../../../routes";
import { ProteinNetwork } from "../../../domain/entities/ProteinNetwork";

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
    proteinNetwork: Maybe<ProteinNetwork>;
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
    const { proteinNetwork } = options;
    const { compositionRoot } = useAppContext();
    const [pdbePlugin0, setPdbePlugin] = React.useState<PDBeMolstarPlugin>();
    const [pluginLoad, setPluginLoad] = React.useState<Date>();
    const [isLoading, { enable: showLoading, disable: hideLoading }] = useBooleanState(false);
    const pdbePlugin = pdbePlugin0 && pluginLoad ? pdbePlugin0 : undefined;

    // Keep a reference containing the previous value of selection. We need this value to diff
    // the new state against the old state and perform imperative operations (add/remove/update)
    // on the plugin.
    const [prevSelectionRef, setPrevSelection] = useReference<Selection>();

    debugVariable({ pdbePlugin });

    React.useEffect(() => {
        if (!pluginLoad || !pdbePlugin) return;
        const ligands = getLigands(pdbePlugin, newSelection) || [];
        debugVariable({ ligands: ligands.length });
        onLigandsLoaded(ligands);

        setVisibilityForSelection(pdbePlugin, newSelection);
        highlight(pdbePlugin, newSelection);
    }, [pluginLoad, pdbePlugin, onLigandsLoaded, newSelection]);

    const pluginRef = React.useCallback(
        async (element: HTMLDivElement | null) => {
            if (!element) return;
            const currentSelection = prevSelectionRef.current;
            const pluginAlreadyRendered = Boolean(pdbePlugin);
            const ligandChanged =
                currentSelection && currentSelection.ligandId !== newSelection.ligandId;

            if (!ligandChanged && pluginAlreadyRendered) return;

            const plugin = pdbePlugin || new window.PDBeMolstarPlugin();
            const initParams = getPdbePluginInitParams(plugin, newSelection);
            debugVariable({ pdbeMolstarPlugin: plugin });

            // To subscribe to the load event: plugin.events.loadComplete.subscribe(loaded => { ... });
            if (pluginAlreadyRendered) {
                showLoading();
                await plugin.visual.update(initParams);
            } else {
                plugin.events.loadComplete.subscribe(loaded => {
                    console.debug("molstar.events.loadComplete", loaded);
                    hideLoading();
                    if (loaded) setPluginLoad(new Date());
                    // On FF, the canvas sometimes shows a black box. Resize the viewport to force a redraw
                    window.dispatchEvent(new Event("resize"));
                });

                plugin.render(element, initParams);
            }

            setPdbePlugin(plugin);
        },
        [pdbePlugin, newSelection, prevSelectionRef, showLoading, hideLoading]
    );

    const updatePluginOnNewSelection = React.useCallback(() => {
        if (!pdbePlugin) return _.noop;

        function updateSelection(currentSelection: Selection, newSelection: Selection): void {
            if (!pdbePlugin) return;

            applySelectionChangesToPlugin(pdbePlugin, currentSelection, newSelection, showLoading);
            setSelection(newSelection);
        }

        const currentSelection = prevSelectionRef.current || emptySelection;
        setPrevSelection(newSelection);

        const uploadDataRemoved =
            currentSelection.type === "uploadData" && newSelection.type !== "uploadData";

        if (uploadDataRemoved) pdbePlugin.visual.remove({});

        if (newSelection.type !== "free") return _.noop;

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

    const uploadDataToken = newSelection.type === "uploadData" ? newSelection.token : undefined;

    React.useEffect(() => {
        if (!pdbePlugin) return;

        pdbePlugin.visual.remove({});
        if (!uploadDataToken) return;

        pdbePlugin.load(
            {
                url: `${routes.bionotesDev}/upload/${uploadDataToken}/structure_file.cif`,
                format: "mmcif",
                isBinary: false,
                assemblyId: "1",
            },
            false
        );
    }, [pdbePlugin, uploadDataToken, compositionRoot]);

    React.useEffect(() => {
        if (!pdbePlugin) return;

        pdbePlugin.visual.remove({});
        if (!proteinNetwork) return;

        const chainInNetwork =
            proteinNetwork.uploadData.chains.find(chain => chain.chain === newSelection.chainId) ||
            _.first(proteinNetwork.uploadData.chains);

        const pdbPath = chainInNetwork?.pdbPath;
        if (!pdbPath) return;

        pdbePlugin.load(
            {
                url: `${routes.bionotes}/${pdbPath}`,
                format: "pdb",
                isBinary: false,
                assemblyId: "1",
            },
            false
        );
    }, [pdbePlugin, newSelection.chainId, proteinNetwork, compositionRoot]);

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
            await loadEmdb(plugin, item.id);
            setEmdbOpacity({ plugin, id: item.id, value: 0.5 });
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
        moleculeId: pdbId, // empty not to render on init (here URL is not fully configurable)
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
