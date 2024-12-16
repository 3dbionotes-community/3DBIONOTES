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
} from "./usePdbPlugin";
import { debugVariable, isDebugMode } from "../../../utils/debug";
import { Maybe } from "../../../utils/ts-utils";
import { LoaderKey, loaderKeys } from "../RootViewerContents";
import { useAppContext } from "../AppContext";
import { routes } from "../../../routes";
import { MolstarState, MolstarStateActions } from "./MolstarState";
import i18n from "../../utils/i18n";

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
            if (newSelection.chainId === chainId) {
                console.debug("Chain already set", chainId);
                return;
            }

            console.debug("Set chain through molstar", chainId);
            setSelection(setSelectionChain(newSelection, chainId));
        },
        [setSelection, newSelection]
    );

    React.useEffect(() => {
        if (pdbePlugin) pdbePlugin.visual.updateDependency.onChainUpdate(setChain);
    }, [pdbePlugin, setChain]);

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
            const initParams = getPdbePluginInitParams(newSelection, setChain);
            debugVariable({ pdbeMolstarPlugin: plugin });
            const mainPdb = getMainItem(newSelection, "pdb");
            const emdbId = getMainItem(newSelection, "emdb");

            function loadVoidMolstar(message: string) {
                if (!element) return;
                plugin.render(element, getVoidInitParams(setChain)).then(() =>
                    plugin.canvas.showToast({
                        title: i18n.t("Error"),
                        message,
                        key: "init",
                    })
                );
            }

            function getPdbFromEmdb(emdbId: string) {
                updateLoader(
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
                const loadComplete = new Promise<void>((resolve, reject) => {
                    plugin.events.loadComplete.subscribe({
                        next: loaded => {
                            console.debug("molstar.events.loadComplete", loaded);
                            if (loaded) {
                                setPluginLoad(new Date());
                                // On FF, the canvas sometimes shows a black box. Resize the viewport to force a redraw
                                window.dispatchEvent(new Event("resize"));

                                // When viewer is already rendered, update the ligand in molstar sequence if present
                                if (newSelection.ligandId && newSelection.chainId)
                                    plugin.visual.updateLigand({
                                        ligandId: newSelection.ligandId,
                                        chainId: newSelection.chainId,
                                    });
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

            function loadFromPdb(pdbId: string, element: HTMLDivElement) {
                checkModelUrl(pdbId, "pdb")
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

            if (chainChanged && pluginAlreadyRendered && newSelection.chainId) {
                plugin.visual.updateChain(newSelection.chainId);
            } else if (pluginAlreadyRendered) {
                //When ligand has changed
                molstarState.current = MolstarStateActions.fromInitParams(initParams, newSelection);
                await updateLoader("updateVisualPlugin", plugin.visual.update(initParams));
                if (newSelection.ligandId && newSelection.chainId)
                    plugin.visual.updateLigand({
                        ligandId: newSelection.ligandId,
                        chainId: newSelection.chainId,
                    });
                if (newSelection.ligandId === undefined && newSelection.type === "free") {
                    // Out of the ligand view or pdb is different for example
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
            } else if (!mainPdb && emdbId) getPdbFromEmdb(emdbId);
            else {
                subscribeSequenceComplete();
                subscribeLoadComplete();
                const pdbId = initParams.moleculeId;
                if (pdbId) loadFromPdb(pdbId, element);
                else if (newSelection.type === "uploadData") await loadFromUploadData(element);
                else loadVoidMolstar(loaderErrors.undefinedPdb);
            }

            setPdbePlugin(plugin);
        },
        [
            prevSelectionRef,
            pdbePlugin,
            newSelection,
            setChain,
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

function getPdbePluginInitParams(
    newSelection: Selection,
    onChainUpdate: (chainId: string) => void
): InitParams {
    const pdbId = getMainItem(newSelection, "pdb");
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
        onChainUpdate: onChainUpdate,
    };
}

function getVoidInitParams(onChainUpdate: (chainId: string) => void): InitParams {
    return {
        moleculeId: undefined,
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
    };
}
