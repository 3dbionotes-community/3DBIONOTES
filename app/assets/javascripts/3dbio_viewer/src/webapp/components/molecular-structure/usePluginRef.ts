import _ from "lodash";
import React from "react";
import { PDBeMolstarPlugin } from "@3dbionotes/pdbe-molstar/lib";
import { InitParams } from "@3dbionotes/pdbe-molstar/lib/spec";
import {
    AllowedExtension,
    getMainItem,
    Selection,
    setMainItem,
    setSelectionChain,
} from "../../view-models/Selection";
import {
    applySelectionChangesToPlugin,
    checkModelUrl,
    checkUploadedModelUrl,
    getErrorByStatus,
    getLigandView,
    loaderErrors,
    setVisibility,
    urls,
} from "./usePdbPlugin";
import { debugVariable, isDebugMode } from "../../../utils/debug";
import { Maybe } from "../../../utils/ts-utils";
import { LoaderKey, loaderKeys } from "../RootViewerContents";
import { useAppContext } from "../AppContext";
import { routes } from "../../../routes";
import { MolstarState, MolstarStateActions } from "./MolstarState";
import i18n from "../../utils/i18n";
import { getCurrentItems, loadEmdb, setEmdbOpacity } from "./molstar";

type Options = {
    prevSelectionRef: React.MutableRefObject<Selection | undefined>;
    pdbePlugin: Maybe<PDBeMolstarPlugin>;
    newSelection: Selection;
    updateLoader: <T>(key: LoaderKey, promise: Promise<T>, message?: string) => Promise<T>;
    setSelection: (newSelection: Selection) => void;
    uploadDataToken: Maybe<string>;
    extension: Maybe<AllowedExtension>;
    molstarState: React.MutableRefObject<MolstarState>;
    setPdbePlugin: React.Dispatch<React.SetStateAction<PDBeMolstarPlugin | undefined>>;
    setPluginLoad: React.Dispatch<React.SetStateAction<Date | undefined>>;
};

export function usePluginRef(options: Options) {
    const { compositionRoot } = useAppContext();
    const {
        prevSelectionRef,
        pdbePlugin,
        newSelection,
        updateLoader,
        setSelection,
        setPluginLoad,
        uploadDataToken,
        extension,
        molstarState,
        setPdbePlugin,
    } = options;

    // Set chain through molstar
    const setChain = React.useCallback(
        (chainId: string) => {
            if (newSelection.ligandId !== undefined) {
                console.debug("In ligand view. Not changing chain", newSelection.ligandId);
                return;
            }

            if (newSelection.chainId === chainId) {
                console.debug("Chain already set", chainId);
                return;
            }

            console.debug("Set chain through molstar", chainId);
            setSelection(setSelectionChain(newSelection, chainId));
        },
        [setSelection, newSelection]
    );

    const getLigandViewState = React.useCallback(() => newSelection.ligandId !== undefined, [
        newSelection.ligandId,
    ]);

    React.useEffect(() => {
        if (pdbePlugin) pdbePlugin.visual.updateDependency.onChainUpdate(setChain);
    }, [pdbePlugin, setChain]);

    React.useEffect(() => {
        if (pdbePlugin) pdbePlugin.visual.updateDependency.isLigandView(getLigandViewState);
    }, [getLigandViewState, pdbePlugin]);

    const pluginRef = React.useCallback(
        async (element: HTMLDivElement | null) => {
            if (!element) return;
            const currentSelection = prevSelectionRef.current;
            const pluginAlreadyRendered = Boolean(pdbePlugin);
            const ligandChanged =
                currentSelection && currentSelection.ligandId !== newSelection.ligandId;
            const chainChanged =
                currentSelection && currentSelection.chainId !== newSelection.chainId;

            if (!ligandChanged && !chainChanged && pluginAlreadyRendered) return;

            const plugin = pdbePlugin || new window.PDBeMolstarPlugin();
            const initParams = getPdbePluginInitParams(newSelection, setChain, getLigandViewState);
            debugVariable({ pdbeMolstarPlugin: plugin });
            const mainPdb = getMainItem(newSelection, "pdb");
            const emdbId = getMainItem(newSelection, "emdb");

            function loadVoidMolstar(message: string) {
                if (!element) return;
                plugin.render(element, getVoidInitParams(setChain, getLigandViewState)).then(() =>
                    plugin.canvas.showToast({
                        title: i18n.t("Error"),
                        message,
                        key: "init",
                    })
                );
            }

            async function getPdbFromEmdb(emdbId: string) {
                await updateLoader(
                    loaderKeys.getRelatedPdbModel,
                    new Promise<void>((resolve, reject) => {
                        compositionRoot.getRelatedModels
                            .pdbFromEmdb(emdbId)
                            .toPromise()
                            .then(pdbId => {
                                if (!pdbId) reject(loaderErrors.pdbNotMatching);
                                else {
                                    setSelection(setMainItem(newSelection, pdbId, "pdb"));
                                    resolve();
                                }
                            });
                    })
                );
            }

            function subscribeLoadComplete() {
                /* Load complete is dispatched almost in every scenario: render(), update(), load(), which also involves enter/exiting ligand view  */
                const loadComplete = new Promise<void>((resolve, reject) => {
                    plugin.events.loadComplete.subscribe({
                        next: loaded => {
                            console.debug("molstar.events.loadComplete", loaded);
                            if (loaded) {
                                setPluginLoad(new Date());
                                // On FF, the canvas sometimes shows a black box. Resize the viewport to force a redraw
                                window.dispatchEvent(new Event("resize"));
                                updateSequenceViewAfterLoadComplete(
                                    prevSelectionRef,
                                    plugin,
                                    newSelection
                                );
                                resolve();
                            } else reject(loaderErrors.pdbNotLoaded);
                        },
                        error: err => {
                            console.error(err);
                            reject(err);
                        },
                    });
                });

                updateLoader(loaderKeys.initPlugin, loadComplete);
            }

            function subscribeSequenceComplete() {
                const sequenceComplete = new Promise<void>((resolve, reject) => {
                    plugin.events.sequenceComplete.subscribe({
                        next: sequence => {
                            console.debug("molstar.events.sequenceComplete", sequence);
                            resolve();
                        },
                        error: err => {
                            console.error(err);
                            reject(err);
                        },
                    });
                });

                updateLoader(loaderKeys.readingSequence, sequenceComplete);
            }

            async function loadFromUploadData(element: HTMLDivElement) {
                if (!uploadDataToken) {
                    loadVoidMolstar(loaderErrors.tokenNotFound);
                    await updateLoader(
                        loaderKeys.uploadedModel,
                        Promise.reject(loaderErrors.tokenNotFound)
                    );
                    return;
                }

                if (!extension) {
                    loadVoidMolstar(loaderErrors.invalidExtension);
                    await updateLoader(
                        loaderKeys.uploadedModel,
                        Promise.reject(loaderErrors.invalidExtension)
                    );
                    return;
                }

                const supportedExtension = extension === "ent" ? "pdb" : extension;
                const customData = {
                    url: `${routes.bionotes}/upload/${uploadDataToken}/structure_file.${supportedExtension}`,
                    format: extension === "cif" ? "mmcif" : "pdb",
                    binary: false,
                };

                await checkUploadedModelUrl(customData.url)
                    .then(result => {
                        if (result) {
                            const newParams = { ...initParams, customData };
                            plugin.render(element, newParams);
                            molstarState.current = MolstarStateActions.fromInitParams(
                                newParams,
                                newSelection
                            );
                        } else {
                            loadVoidMolstar(loaderErrors.invalidToken);
                            return updateLoader(
                                loaderKeys.uploadedModel,
                                Promise.reject(loaderErrors.invalidToken)
                            );
                        }
                    })
                    .catch(_err => {
                        loadVoidMolstar(loaderErrors.unexpectedUploadError(customData.url));
                        return updateLoader(
                            loaderKeys.uploadedModel,
                            Promise.reject(loaderErrors.unexpectedUploadError(customData.url))
                        );
                    });
            }

            async function loadFromPdb(pdbId: string, element: HTMLDivElement) {
                await checkModelUrl(pdbId, "pdb")
                    .then(res => {
                        if (res.loaded) {
                            plugin.render(element, initParams);
                            molstarState.current = MolstarStateActions.fromInitParams(
                                initParams,
                                newSelection
                            );
                        } else loadVoidMolstar(getErrorByStatus(pdbId, res.status));
                    })
                    .catch(err => loadVoidMolstar(err));
            }

            function setVisibilityAfterLoad(initParams: InitParams, plugin: PDBeMolstarPlugin) {
                molstarState.current = MolstarStateActions.fromInitParams(initParams, newSelection);

                if (newSelection.type === "free") {
                    if (newSelection.main.pdb) setVisibility(plugin, newSelection.main.pdb);
                    if (newSelection.main.emdb) {
                        setVisibility(plugin, newSelection.main.emdb);
                        setEmdbOpacity({ plugin, id: newSelection.main.emdb.id, value: 0.5 });
                    }
                }
            }

            async function loadEmdbModel(emdbId: string, plugin: PDBeMolstarPlugin): Promise<void> {
                await checkModelUrl(emdbId, "emdb").then(async res => {
                    if (res.loaded) {
                        await updateLoader(
                            "loadModel",
                            loadEmdb(plugin, urls.emdb(emdbId)),
                            i18n.t("Loading EMDB...")
                        );
                        setEmdbOpacity({ plugin, id: emdbId, value: 0.5 });
                    } else
                        plugin.canvas.showToast({
                            title: i18n.t("Error"),
                            message: getErrorByStatus(emdbId, res.status),
                            key: "init",
                        });
                });
            }

            async function loadWithBothPdbEmdb(
                pdbId: string,
                emdbId: string,
                element: HTMLDivElement
            ) {
                await checkModelUrl(pdbId, "pdb")
                    .then(res => {
                        if (res.loaded) {
                            return plugin
                                .render(element, initParams)
                                .then(() =>
                                    newSelection.ligandId === undefined
                                        ? loadEmdbModel(emdbId, plugin)
                                        : Promise.resolve()
                                )
                                .then(() => setVisibilityAfterLoad(initParams, plugin));
                        } else loadVoidMolstar(getErrorByStatus(pdbId, res.status));
                    })
                    .catch(err => loadVoidMolstar(err));
            }

            async function initializePdbeMolstar(element: HTMLDivElement) {
                subscribeSequenceComplete();
                subscribeLoadComplete();
                const pdbId = initParams.moleculeId;
                if (pdbId && emdbId) await loadWithBothPdbEmdb(pdbId, emdbId, element);
                else if (pdbId) await loadFromPdb(pdbId, element);
                else if (newSelection.type === "uploadData") await loadFromUploadData(element);
                else loadVoidMolstar(loaderErrors.undefinedPdb);
            }

            function loadEmdbIfNotPresent(): Promise<void> {
                // Check if EMDB is already loaded
                const items = getCurrentItems(plugin);
                if (items.some(item => item.type === "emdb" && item.id === emdbId))
                    return Promise.resolve();

                // Load EMDB if not loaded, for example when exiting ligandView
                return emdbId && newSelection.ligandId === undefined
                    ? loadEmdbModel(emdbId, plugin)
                    : Promise.resolve();
            }

            async function mainModelChangedOrLigandView() {
                molstarState.current = MolstarStateActions.fromInitParams(initParams, newSelection);

                // Scenario: entering ligand view, exiting ligand view and realoading pdb and emdb, or pdb has changed.
                await updateLoader("updateVisualPlugin", plugin.visual.update(initParams))
                    .then(loadEmdbIfNotPresent)
                    .then(() => setVisibilityAfterLoad(initParams, plugin));

                // Load extra appended models (if is not ligand view)
                if (newSelection.ligandId === undefined && newSelection.type === "free")
                    await updateLoader(
                        "updateVisualPlugin",
                        applySelectionChangesToPlugin(
                            plugin,
                            molstarState,
                            newSelection,
                            updateLoader
                        )
                    );
            }

            function updateMolstarSequenceChain(chainId: string) {
                console.debug("Updating chain in molstar sequence", newSelection);
                plugin.visual.updateChain(chainId);
            }

            if (chainChanged && newSelection.chainId && !newSelection.ligandId) {
                updateMolstarSequenceChain(newSelection.chainId);
            } else if (pluginAlreadyRendered) {
                await mainModelChangedOrLigandView();
            } else if (!mainPdb && emdbId) {
                await getPdbFromEmdb(emdbId);
            } else {
                await initializePdbeMolstar(element);
            }

            setPdbePlugin(plugin);
        },
        [
            prevSelectionRef,
            pdbePlugin,
            newSelection,
            setChain,
            getLigandViewState,
            setPdbePlugin,
            updateLoader,
            compositionRoot.getRelatedModels,
            setSelection,
            setPluginLoad,
            uploadDataToken,
            extension,
            molstarState,
        ]
    );

    return { pluginRef };
}

const colors = {
    black: { r: 0, g: 0, b: 0 },
    white: { r: 255, g: 255, b: 255 },
};

function updateSequenceViewAfterLoadComplete(
    prevSelectionRef: React.MutableRefObject<Selection | undefined>,
    plugin: PDBeMolstarPlugin,
    newSelection: Selection
) {
    const currentSelection = prevSelectionRef.current;

    updateSequenceView({
        selection: currentSelection ?? newSelection,
        plugin: plugin,
        firstInit: !currentSelection,
    });
}

function updateSequenceView(args: {
    selection: Selection;
    plugin: PDBeMolstarPlugin;
    firstInit: boolean;
}) {
    const { selection, plugin, firstInit } = args;

    const state = firstInit ? "on first init" : "on update";

    if (selection.chainId) {
        if (selection.ligandId) {
            console.debug(`Updating ligand in molstar sequence view: ${state}`);
            plugin.visual.updateLigand({
                ligandId: selection.ligandId,
                chainId: selection.chainId,
            });
        } else {
            console.debug(`Updating chain in molstar sequence view: ${state}`);
            plugin.visual.updateChain(selection.chainId);
        }
    }
}

function getPdbePluginInitParams(
    newSelection: Selection,
    onChainUpdate: (chainId: string) => void,
    isLigandView: () => boolean
): InitParams {
    const pdbId = getMainItem(newSelection, "pdb");
    const emdbId = getMainItem(newSelection, "emdb");
    const ligandView = getLigandView(newSelection);

    return {
        moleculeId: pdbId, // empty not to render on init (here URL is not fully configurable)
        mapId: emdbId,
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
        onChainUpdate: onChainUpdate,
        isLigandView: isLigandView,
    };
}

function getVoidInitParams(
    onChainUpdate: (chainId: string) => void,
    isLigandView: () => boolean
): InitParams {
    return {
        moleculeId: undefined,
        mapId: undefined,
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
        ligandView: undefined,
        mapSettings: {},
        onChainUpdate: onChainUpdate,
        isLigandView: isLigandView,
    };
}
