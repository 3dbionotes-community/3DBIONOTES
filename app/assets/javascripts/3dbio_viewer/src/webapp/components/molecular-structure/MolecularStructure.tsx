import React from "react";
import _ from "lodash";
import { InitParams } from "@3dbionotes/pdbe-molstar/lib/spec";
import { PDBeMolstarPlugin } from "@3dbionotes/pdbe-molstar/lib";
import {
    DbItem,
    diffDbItems,
    emptySelection,
    getItems,
    getItemSelector,
    getMainChanges,
    getMainEmdbId,
    getMainPdbId,
    Selection,
    setMainEmdb,
    setMainPdb,
} from "../../view-models/Selection";
import { debugVariable, isDebugMode } from "../../../utils/debug";
import { useReference } from "../../hooks/use-reference";
import { useAppContext } from "../AppContext";
import { getLigands, loadEmdb, setEmdbOpacity } from "./molstar";
import { Ligand } from "../../../domain/entities/Ligand";
import { PdbInfo } from "../../../domain/entities/PdbInfo";
import { Maybe } from "../../../utils/ts-utils";
import { LoaderMask } from "../loader-mask/LoaderMask";
import { routes } from "../../../routes";
import { ProteinNetwork } from "../../../domain/entities/ProteinNetwork";
import i18n from "../../utils/i18n";
import "./molstar.css";
import "./molstar-light.css";
import { getSelectedChain } from "../viewer-selector/ViewerSelector";
import { MolstarState, MolstarStateActions } from "./MolstarState";
import { LoadParams } from "@3dbionotes/pdbe-molstar/lib/helpers";

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
    title: string;
    setTitle: (title: string) => void;
    isLoading: boolean;
    showLoading: () => void;
    hideLoading: () => void;
    setError: (message: string) => void;
}

const urls = {
    pdb: (id: string) => `https://www.ebi.ac.uk/pdbe/model-server/v1/${id}/full?encoding=cif`,
    emdb: (id: string) => `https://maps.rcsb.org/em/${id}/cell?detail=3`,
};

export const MolecularStructure: React.FC<MolecularStructureProps> = props => {
    const { pluginRef } = usePdbePlugin(props);

    return (
        <React.Fragment>
            <LoaderMask open={props.isLoading} title={props.title} />

            <div ref={pluginRef} className="molecular-structure"></div>
        </React.Fragment>
    );
};

function usePdbePlugin(options: MolecularStructureProps) {
    const {
        selection: newSelection,
        onSelectionChange: setSelection,
        onLigandsLoaded,
        setTitle,
        isLoading,
        showLoading,
        hideLoading,
    } = options;
    const { proteinNetwork, setError } = options;
    const { compositionRoot } = useAppContext();
    const [pdbePlugin0, setPdbePlugin] = React.useState<PDBeMolstarPlugin>();
    const [pluginLoad, setPluginLoad] = React.useState<Date>();
    const pdbePlugin = pdbePlugin0 && pluginLoad ? pdbePlugin0 : undefined;
    const molstarState = React.useRef<MolstarState>({ type: "pdb", items: [], chainId: undefined });
    debugVariable({ molstarState });

    // Keep a reference containing the previous value of selection. We need this value to diff
    // the new state against the old state and perform imperative operations (add/remove/update)
    // on the plugin.
    const [prevSelectionRef, setPrevSelection] = useReference<Selection>();

    debugVariable({ pdbePlugin });
    const chains = options.pdbInfo?.chains;

    React.useEffect(() => {
        if (!pluginLoad || !pdbePlugin) return;
        if (!newSelection.ligandId) {
            const ligands = getLigands(pdbePlugin, newSelection) || [];
            debugVariable({ ligands: ligands.length });
            onLigandsLoaded(ligands);
        }

        setVisibilityForSelection(pdbePlugin, newSelection);
        highlight(pdbePlugin, chains, newSelection, molstarState);
    }, [pluginLoad, pdbePlugin, onLigandsLoaded, newSelection, chains]);

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
            const mainPdb = getMainPdbId(newSelection);
            const emdbId = getMainEmdbId(newSelection);

            // To subscribe to the load event: plugin.events.loadComplete.subscribe(loaded => { ... });
            if (pluginAlreadyRendered) {
                molstarState.current = MolstarStateActions.fromInitParams(initParams, newSelection);
                await plugin.visual.update(initParams);
            } else if (!mainPdb && emdbId) {
                compositionRoot.getRelatedModels.pdbFromEmdb(emdbId).run(pdbId => {
                    if (!pdbId) {
                        // Discuss what to do in this situation
                        showLoading();
                        setTitle("Unable to init plugin without PDB...");
                    }
                    setSelection(setMainPdb(newSelection, pdbId));
                }, console.error);
            } else {
                plugin.events.loadComplete.subscribe({
                    next: loaded => {
                        console.debug("molstar.events.loadComplete", loaded);
                        if (loaded) {
                            setPluginLoad(new Date());
                            hideLoading();
                        } else setTitle("Didn't load");
                        // On FF, the canvas sometimes shows a black box. Resize the viewport to force a redraw
                        window.dispatchEvent(new Event("resize"));
                    },
                    error: err => {
                        console.error(err);
                    },
                });

                const pdbId = initParams.moleculeId;
                checkPdbModelUrl(pdbId).then(loaded => {
                    if (loaded) {
                        plugin.render(element, initParams).then(() => {
                            showLoading();
                            // Starting pdbe-molstar-plugin, but because the plugin cannot init without PDB, we are already loading the PDB.
                            setTitle("Loading PDB...");
                        });
                        molstarState.current = MolstarStateActions.fromInitParams(
                            initParams,
                            newSelection
                        );
                    } else {
                        hideLoading();
                        setError(`PDB not found${pdbId ? ": " + pdbId : ""}`);
                    }
                });
            }

            setPdbePlugin(plugin);
        },
        [
            setError,
            pdbePlugin,
            newSelection,
            prevSelectionRef,
            showLoading,
            setTitle,
            compositionRoot,
            hideLoading,
            setSelection,
        ]
    );

    const updatePluginOnNewSelection = React.useCallback(() => {
        if (!pdbePlugin) return _.noop;
        if (isLoading) return _.noop;

        function updateSelection(currentSelection: Selection, newSelection: Selection): void {
            if (!pdbePlugin) return;

            applySelectionChangesToPlugin(
                pdbePlugin,
                molstarState,
                chains,
                currentSelection,
                newSelection,
                showLoading,
                setTitle,
                hideLoading,
                setError
            );
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
            compositionRoot.getRelatedModels.emdbFromPdb(pdbId).run(emdbId => {
                updateSelection(currentSelection, setMainEmdb(newSelection, emdbId));
            }, console.error);
        } else if (emdbId) {
            compositionRoot.getRelatedModels.pdbFromEmdb(emdbId).run(pdbId => {
                updateSelection(currentSelection, setMainPdb(newSelection, pdbId));
            }, console.error);
        } else {
            updateSelection(currentSelection, newSelection);
        }
    }, [
        compositionRoot,
        pdbePlugin,
        newSelection,
        prevSelectionRef,
        setPrevSelection,
        setSelection,
        showLoading,
        hideLoading,
        setTitle,
        chains,
        isLoading,
        setError,
    ]);

    const updatePluginOnNewSelectionEffect = updatePluginOnNewSelection;
    React.useEffect(updatePluginOnNewSelectionEffect, [updatePluginOnNewSelectionEffect]);

    const uploadDataToken = newSelection.type === "uploadData" ? newSelection.token : undefined;

    React.useEffect(() => {
        if (!pdbePlugin) return;
        if (!uploadDataToken) return;
        pdbePlugin.visual.remove({});

        // For future reference on this commit: setTitle(i18n.t("Applying..."));
        // hide on promise finished.
        pdbePlugin.load(
            {
                url: `${routes.bionotesStaging}/upload/${uploadDataToken}/structure_file.cif`,
                format: "mmcif",
                isBinary: false,
                assemblyId: "1",
            },
            false
        );
    }, [pdbePlugin, uploadDataToken, compositionRoot]);

    React.useEffect(() => {
        if (!pdbePlugin) return;
        if (!proteinNetwork) return;
        pdbePlugin.visual.remove({});

        const chainInNetwork =
            proteinNetwork.uploadData.chains.find(chain => chain.chain === newSelection.chainId) ||
            _.first(proteinNetwork.uploadData.chains);

        const pdbPath = chainInNetwork?.pdbPath;
        if (!pdbPath) return;

        // For future reference on this commit: setTitle(i18n.t("Applying..."));
        // hide on promise finished.
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

    return { pluginRef, pdbePlugin };
}

function setVisibilityForSelection(plugin: PDBeMolstarPlugin, selection: Selection) {
    getItems(selection).forEach(item => setVisibility(plugin, item));
}

function setVisibility(plugin: PDBeMolstarPlugin, item: DbItem) {
    const selector = getItemSelector(item);
    return plugin.visual.setVisibility(selector, item.visible || false);
}

async function applySelectionChangesToPlugin(
    plugin: PDBeMolstarPlugin,
    molstarState: MolstarStateRef,
    chains: Maybe<PdbInfo["chains"]>,
    currentSelection: Selection,
    newSelection: Selection,
    showLoading: () => void,
    setTitle: (title: string) => void,
    hideLoading: () => void,
    setError: (message: string) => void
): Promise<void> {
    if (molstarState.current.type !== "pdb") return;

    const oldItems = () => (molstarState.current.type === "pdb" ? molstarState.current.items : []);
    const newItems = getItems(newSelection);

    const { added, removed, updated } = diffDbItems(newItems, oldItems());
    const pdbs = added.filter(item => item.type === "pdb");
    const emdbs = added.filter(item => item.type === "emdb");

    if (!_.isEmpty(newItems)) showLoading();

    console.debug(
        "Update molstar:",
        _({ oldItems: oldItems(), added, removed, updated })
            .mapValues(objs => objs.map(obj => obj.id).join(", "))
            .pickBy()
            .value()
    );

    for (const item of removed) {
        plugin.visual.remove(getItemSelector(item));
        molstarState.current = MolstarStateActions.updateItems(
            molstarState.current,
            _.differenceBy(oldItems(), [item], getId)
        );
    }

    for (const item of updated) {
        setVisibility(plugin, item);
        molstarState.current = MolstarStateActions.updateItems(
            molstarState.current,
            oldItems().map(item_ => (item_.id === item.id ? item : item_))
        );
    }

    for (let i = 0; i < pdbs.length; i++) {
        const item = pdbs[i];
        if (item) {
            const pdbId: string = item.id;
            await checkPdbModelUrl(pdbId).then(async loaded => {
                if (loaded) {
                    const url = urls.pdb(pdbId);
                    const loadParams: LoadParams = {
                        url,
                        format: "mmcif",
                        isBinary: false,
                        assemblyId: "1",
                    };
                    if (pdbs.length > 1)
                        setTitle(i18n.t(`Loading PDB (${i + 1}/${pdbs.length})...`));
                    else setTitle(i18n.t("Loading PDB..."));
                    await plugin.load(loadParams, false);
                    setVisibility(plugin, item);

                    molstarState.current = MolstarStateActions.updateItems(
                        molstarState.current,
                        _.unionBy(oldItems(), [item], getId)
                    );
                } else {
                    hideLoading();
                    setError(`PDB not found: ${pdbId}`);
                }
            });
        }
    }

    for (let i = 0; i < emdbs.length; i++) {
        const item = emdbs[i];
        if (item) {
            if (emdbs.length > 1) setTitle(i18n.t(`Loading EMDB (${i + 1}/${emdbs.length})...`));
            else setTitle(i18n.t("Loading EMDB..."));
            molstarState.current = MolstarStateActions.updateItems(
                molstarState.current,
                _.unionBy(oldItems(), [item], getId)
            );
            await loadEmdb(plugin, urls.emdb(item.id));
            setEmdbOpacity({ plugin, id: item.id, value: 0.5 });
            setVisibility(plugin, item);
        }
    }

    if (newSelection.chainId !== currentSelection.chainId) {
        highlight(plugin, chains, newSelection, molstarState);
    }

    if (!_.isEmpty(newItems)) hideLoading();
    plugin.visual.reset({ camera: true });
}

async function highlight(
    plugin: PDBeMolstarPlugin,
    chains: Maybe<PdbInfo["chains"]>,
    selection: Selection,
    molstarState: MolstarStateRef
): Promise<void> {
    plugin.visual.clearSelection().catch(_err => {});
    const ligandsView = getLigandView(selection);
    if (ligandsView) return;

    const chain = getSelectedChain(chains, selection);
    const chainId = selection.chainId;
    molstarState.current = MolstarStateActions.setChain(molstarState.current, chainId);

    if (!chain) return;

    try {
        await plugin.visual.select({
            data: [
                {
                    struct_asym_id: chain.chainId,
                    color: "#0000ff",
                    focus: true,
                },
            ],
            nonSelectedColor: { r: 255, g: 255, b: 255 },
        });
    } catch (err: any) {
        console.error("highlight", err);
    }
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
        showDebugPanels: isDebugMode(),
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

type MolstarStateRef = React.MutableRefObject<MolstarState>;

function getId<T extends { id: string }>(obj: T): string {
    return obj.id;
}

async function checkPdbModelUrl(pdbId: Maybe<string>): Promise<boolean> {
    if (!pdbId) return true;

    const url = urls.pdb(pdbId);
    const res = await fetch(url, { method: "HEAD" });

    if (res.ok) {
        return true;
    } else {
        const msg = `Error loading PDB model: url=${url} - ${res.status}`;
        console.error(msg);
        return false;
    }
}
