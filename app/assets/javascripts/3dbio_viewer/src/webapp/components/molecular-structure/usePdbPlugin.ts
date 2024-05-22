import React from "react";
import _ from "lodash";
import { InitParams } from "@3dbionotes/pdbe-molstar/lib/spec";
import { PDBeMolstarPlugin } from "@3dbionotes/pdbe-molstar/lib";
import { LoadParams } from "@3dbionotes/pdbe-molstar/lib/helpers";
import {
    BaseSelection,
    DbItem,
    diffDbItems,
    emptySelection,
    getItems,
    getItemSelector,
    getMainChanges,
    getMainItem,
    getRefinedModelId,
    RefinedModelType,
    Selection,
    setMainItem,
    Type,
} from "../../view-models/Selection";
import { debugVariable } from "../../../utils/debug";
import { useReference } from "../../hooks/use-reference";
import { useAppContext } from "../AppContext";
import { getLigands, loadEmdb, setEmdbOpacity } from "./molstar";
import { PdbInfo } from "../../../domain/entities/PdbInfo";
import { Maybe } from "../../../utils/ts-utils";
import { routes } from "../../../routes";
import { getSelectedChain } from "../viewer-selector/ViewerSelector";
import { MolecularStructureProps } from "./MolecularStructure";
import { MolstarState, MolstarStateActions } from "./MolstarState";
import { loaderKeys } from "../RootViewerContents";
import { usePluginRef } from "./usePluginRef";
import i18n from "../../utils/i18n";
import "./molstar.css";
import "./molstar-light.css";

const urls: Record<Type, (id: string) => string> = {
    pdb: (id: string) => `https://www.ebi.ac.uk/pdbe/model-server/v1/${id}/full?encoding=cif`,
    emdb: (id: string) => `https://maps.rcsb.org/em/${id}/cell?detail=3`,
    pdbRedo: (id: string) => `https://pdb-redo.eu/db/${id}/${id}_final.cif`,
    cstf: (id: string) =>
        `https://raw.githubusercontent.com/thorn-lab/coronavirus_structural_task_force/master/pdb/surface_glycoprotein/SARS-CoV-2/${id}/isolde/${id}_refine_7.cif`, //github?
};

export const loaderErrors = {
    pdbNotLoaded: i18n.t("PDB molstar did not load"),
    invalidToken: i18n.t("Invalid token and/or type"),
    tokenNotFound: i18n.t("No token found"),
    undefinedPdb: i18n.t("PDB is not defined"),
    pdbNotMatching: i18n.t("No PDB found for this EMDB model"),
    invalidExtension: i18n.t('The extension must be "pdb", "ent", "cif"'),
    unexpectedUploadError: (url: string) =>
        i18n.t(`Unkown error while loading the model URL: ${url}`),
    modelNotFound: (pdbId: string) => i18n.t(`${pdbId} was not found`),
    serviceUnavailable: (pdbId: string) => i18n.t(`Unable to load ${pdbId}. Service unavailable`),
    pdbRequest: (url: string, status: number) =>
        i18n.t(`Error loading PDB model: url=${url} - ${status}`),
    request: (url: string, status: number) => i18n.t(`Error loading model: url=${url} - ${status}`),
};

const errorsKeys = _.mapValues(loaderErrors, (_v, k) => k);

export function usePdbePlugin(options: MolecularStructureProps) {
    const {
        selection: newSelection,
        onSelectionChange: setSelection,
        onLigandsLoaded,
        updateLoader,
        loaderBusy,
    } = options;
    const { proteinNetwork } = options;
    const { compositionRoot } = useAppContext();
    const [pdbePlugin0, setPdbePlugin] = React.useState<PDBeMolstarPlugin>();
    const [pluginLoad, setPluginLoad] = React.useState<Date>();
    const molstarState = React.useRef<MolstarState>({ type: "pdb", items: [], chainId: undefined });
    const pdbePlugin = pdbePlugin0 && pluginLoad ? pdbePlugin0 : undefined;
    const chainId = newSelection.chainId;
    const ligandId = newSelection.ligandId;
    const chains = React.useMemo(() => options.pdbInfo?.chains ?? [], [options.pdbInfo?.chains]);

    // Keep a reference containing the previous value of selection. We need this value to diff
    // the new state against the old state and perform imperative operations (add/remove/update)
    // on the plugin.
    const [prevSelectionRef, setPrevSelection] = useReference<Selection>();
    const [uploadDataToken, extension] =
        newSelection.type === "uploadData" ? [newSelection.token, newSelection.extension] : [];

    const { pluginRef } = usePluginRef({
        prevSelectionRef,
        pdbePlugin,
        newSelection,
        updateLoader,
        setSelection,
        uploadDataToken,
        extension,
        molstarState,
        setPdbePlugin,
        setPluginLoad,
    });

    debugVariable({ molstarState });
    debugVariable({ pdbePlugin });

    function setLigandsFromMolstar() {
        if (!pluginLoad || !pdbePlugin) return;
        if (!newSelection.ligandId) {
            const ligands = getLigands(pdbePlugin, newSelection) || [];
            debugVariable({ ligands: ligands.length });
            onLigandsLoaded(ligands);
        }
    }

    function applyHighlight() {
        if (!pluginLoad || !pdbePlugin) return;
        highlight(pdbePlugin, chains, { chainId, ligandId }, molstarState, false);
    }

    React.useEffect(setLigandsFromMolstar, [pluginLoad, pdbePlugin, onLigandsLoaded, newSelection]);
    React.useEffect(applyHighlight, [
        pluginLoad,
        prevSelectionRef,
        chains,
        chainId,
        ligandId,
        pdbePlugin,
    ]);

    const updateSelection = React.useCallback(
        (currentSelection: Selection, newSelection: Selection) => {
            if (!pdbePlugin) return;
            const oldItems = getItems(currentSelection);
            const newItems = getItems(newSelection);
            const { added, removed, updated } = diffDbItems(oldItems, newItems);
            if (_.isEmpty(added) && _.isEmpty(removed) && _.isEmpty(updated)) return;

            const validSelection =
                newSelection.type === "free"
                    ? Promise.all(
                          newSelection.refinedModels.map(
                              async model =>
                                  await checkModelUrl(getRefinedModelId(model), model.type).then(
                                      res => {
                                          if (res.loaded) return model;
                                          else {
                                              pdbePlugin.canvas.showToast({
                                                  title: i18n.t("Error"),
                                                  message: getErrorByStatus(model.id, res.status),
                                                  key: errorKeyByStatus(res.status),
                                              });
                                              return undefined;
                                          }
                                      }
                                  )
                          )
                      ).then(models => _.compact(models))
                    : Promise.resolve([]);

            validSelection.then(newValidModels => {
                console.debug("Valid models", newValidModels);
                const refinedNewSelection = {
                    ...newSelection,
                    refinedModels: newValidModels,
                };
                const newRefinedItems = getItems(refinedNewSelection);
                const {
                    added: refinedAdded,
                    removed: refinedRemoved,
                    updated: refinedUpdated,
                } = diffDbItems(oldItems, newRefinedItems);
                /* Refined added/removed/updated are only valid models and when there is a change on them.
            Changes on not valid models will not trigger applySelectionChangesToPlugin() but on setSelection()
            to remove unvalid ones*/

                const hasChanges = !(
                    _.isEmpty(refinedAdded) &&
                    _.isEmpty(refinedRemoved) &&
                    _.isEmpty(refinedUpdated)
                );

                if (hasChanges)
                    updateLoader(
                        "updateVisualPlugin",
                        applySelectionChangesToPlugin(
                            pdbePlugin,
                            molstarState,
                            refinedNewSelection,
                            updateLoader
                        )
                    );
                setSelection(refinedNewSelection);
            });
        },
        [pdbePlugin, setSelection, updateLoader]
    );

    const updatePluginOnNewSelection = React.useCallback(() => {
        if (!pdbePlugin) return _.noop;
        if (loaderBusy) return _.noop;

        const currentSelection = prevSelectionRef.current || emptySelection;

        setPrevSelection(newSelection);

        const uploadDataRemoved =
            currentSelection.type === "uploadData" && newSelection.type !== "uploadData";

        if (uploadDataRemoved) pdbePlugin.visual.remove({});
        if (newSelection.type !== "free") return _.noop;

        const { pdbId, emdbId } = getMainChanges(currentSelection, newSelection);
        if (pdbId) {
            compositionRoot.getRelatedModels.emdbFromPdb(pdbId).run(emdbId => {
                updateSelection(currentSelection, setMainItem(newSelection, emdbId, "emdb"));
            }, console.error);
        } else if (emdbId && getMainItem(currentSelection, "pdb") === undefined) {
            compositionRoot.getRelatedModels.pdbFromEmdb(emdbId).run(pdbId => {
                updateSelection(currentSelection, setMainItem(newSelection, pdbId, "pdb"));
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
        loaderBusy,
        updateSelection,
    ]);

    const updatePluginOnNewSelectionEffect = updatePluginOnNewSelection;
    React.useEffect(updatePluginOnNewSelectionEffect, [updatePluginOnNewSelectionEffect]);

    React.useEffect(() => {
        if (!pdbePlugin) return;
        if (!uploadDataToken) return;
        if (!extension) return;
        pdbePlugin.visual.remove({});
        const supportedExtension = extension === "ent" ? "pdb" : extension;
        const uploadUrl = `${routes.bionotes}/upload/${uploadDataToken}/structure_file.${supportedExtension}`;

        updateLoader(
            loaderKeys.uploadedModel,
            new Promise<void>((resolve, reject) => {
                checkUploadedModelUrl(uploadUrl)
                    .then(res => {
                        if (res.loaded) {
                            pdbePlugin.events.loadComplete.subscribe({
                                next: loaded => {
                                    console.debug("molstar.events.loadComplete", loaded);
                                    if (loaded) resolve();
                                    else reject(loaderErrors.pdbNotLoaded);
                                },
                                error: err => reject(err),
                            });
                            pdbePlugin.load(
                                {
                                    url: uploadUrl,
                                    label: uploadDataToken,
                                    format: extension === "cif" ? "mmcif" : "pdb",
                                    isBinary: false,
                                    assemblyId: "1",
                                },
                                false
                            );
                        } else {
                            reject(loaderErrors.invalidToken);
                            pdbePlugin.canvas.showToast({
                                title: i18n.t("Error"),
                                message: loaderErrors.invalidToken,
                                key: errorsKeys.invalidToken,
                            });
                        }
                    })
                    .catch(_err => {
                        reject(loaderErrors.unexpectedUploadError(uploadUrl));
                        pdbePlugin.canvas.showToast({
                            title: i18n.t("Error"),
                            message: loaderErrors.unexpectedUploadError(uploadUrl),
                            key: errorsKeys.unexpectedUploadError,
                        });
                    });
            })
        );

        // For future reference on this commit: setTitle(i18n.t("Applying..."));
        // hide on promise finished.
    }, [pdbePlugin, uploadDataToken, compositionRoot, extension, updateLoader]);

    function loadFromNetwork() {
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
                label: pdbPath,
                format: "pdb",
                isBinary: false,
                assemblyId: "1",
            },
            false
        );
    }

    React.useEffect(loadFromNetwork, [
        pdbePlugin,
        newSelection.chainId,
        proteinNetwork,
        compositionRoot,
    ]);

    return { pluginRef, pdbePlugin };
}

function setVisibility(plugin: PDBeMolstarPlugin, item: DbItem) {
    const selector = getItemSelector(item);
    return plugin.visual.setVisibility(selector, item.visible || false);
}

export async function applySelectionChangesToPlugin(
    plugin: PDBeMolstarPlugin,
    molstarState: MolstarStateRef,
    newSelection: Selection,
    updateLoader: MolecularStructureProps["updateLoader"]
): Promise<void> {
    if (molstarState.current.type !== "pdb") return;

    const oldItems = () => (molstarState.current.type === "pdb" ? molstarState.current.items : []);
    const updateItems = (item: DbItem) => {
        molstarState.current = MolstarStateActions.updateItems(
            molstarState.current,
            _.unionBy(oldItems(), [item], getId)
        );
    };

    const getTitle = (idx: number, items: DbItem[], modelType: Type) => {
        return items.length > 1
            ? i18n.t(`Loading ${modelType.toUpperCase()} (${idx + 1}/${items.length})...`)
            : i18n.t(`Loading ${modelType.toUpperCase()}...`);
    };

    const loadRefinedItems = async (items: DbItem<RefinedModelType>[]) => {
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item) {
                const id: string = getRefinedModelId(item);
                await checkModelUrl(id, item.type).then(async res => {
                    if (res.loaded) {
                        const url = urls[item.type](id);
                        const loadParams: LoadParams = {
                            url,
                            label: item.id,
                            format: "mmcif",
                            isBinary: false,
                            assemblyId: "1",
                        };
                        await updateLoader(
                            "loadModel",
                            plugin.load(loadParams, false),
                            getTitle(i, items, item.type)
                        );
                        setVisibility(plugin, item);
                        updateItems(item);
                    } else
                        plugin.canvas.showToast({
                            title: i18n.t("Error"),
                            message: getErrorByStatus(id, res.status),
                            key: errorKeyByStatus(res.status),
                        });
                });
            }
        }
    };

    const newItems = getItems(newSelection);

    const { added, removed, updated } = diffDbItems(newItems, oldItems());

    const pdbs = added.filter(item => item.type === "pdb");
    const emdbs = added.filter(item => item.type === "emdb");
    const pdbRedo = added.filter(item => item.type === "pdbRedo");
    const cstf = added.filter(item => item.type === "cstf");

    const mainPdb = oldItems()[0];
    if (mainPdb) setVisibility(plugin, mainPdb);

    console.debug(
        "Update molstar:",
        _({ oldItems: oldItems(), added, removed, updated })
            .mapValues(objs => objs.map(obj => obj.id).join(", "))
            .pickBy()
            .value()
    );

    if (added.length + removed.length) {
        plugin.canvas.hideToasts();
    }

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
            const pdbId = item.id;
            await checkModelUrl(pdbId, "pdb").then(async res => {
                if (res.loaded) {
                    const url = urls.pdb(pdbId);
                    const loadParams: LoadParams = {
                        url,
                        label: pdbId,
                        format: "mmcif",
                        isBinary: false,
                        assemblyId: "1",
                    };
                    await updateLoader(
                        "loadModel",
                        plugin.load(loadParams, false),
                        pdbs.length > 1
                            ? i18n.t(`Loading PDB (${i + 1}/${pdbs.length})...`)
                            : i18n.t("Loading PDB...")
                    );
                    setVisibility(plugin, item);
                    updateItems(item);
                } else if (getMainItem(newSelection, "pdb") === pdbId)
                    updateLoader("loadModel", Promise.reject(getErrorByStatus(pdbId, res.status)));
                if (!res.loaded)
                    plugin.canvas.showToast({
                        title: i18n.t("Error"),
                        message: getErrorByStatus(pdbId, res.status),
                        key: errorKeyByStatus(res.status),
                    });
            });
        }
    }

    for (let i = 0; i < emdbs.length; i++) {
        const item = emdbs[i];
        if (item) {
            const emdbId = item.id;
            await checkModelUrl(emdbId, "emdb").then(async res => {
                if (res.loaded) {
                    await updateLoader(
                        "loadModel",
                        loadEmdb(plugin, urls.emdb(item.id)),
                        emdbs.length > 1
                            ? i18n.t(`Loading EMDB (${i + 1}/${emdbs.length})...`)
                            : i18n.t("Loading EMDB...")
                    );
                    setEmdbOpacity({ plugin, id: item.id, value: 0.5 });
                    setVisibility(plugin, item);
                    updateItems(item);
                } else
                    plugin.canvas.showToast({
                        title: i18n.t("Error"),
                        message: getErrorByStatus(emdbId, res.status),
                        key: errorKeyByStatus(res.status),
                    });
            });
        }
    }

    ([pdbRedo, cstf] as DbItem<RefinedModelType>[][]).forEach(items => loadRefinedItems(items));

    if (added.length + removed.length) {
        plugin.visual.reset({ camera: true });
    }
}

async function highlight(
    plugin: PDBeMolstarPlugin,
    chains: Maybe<PdbInfo["chains"]>,
    selection: BaseSelection,
    molstarState: MolstarStateRef,
    focus = true
): Promise<void> {
    plugin.visual.clearSelection().catch(_err => {});
    plugin.visual.clearHighlight().catch(_err => {}); //remove previous highlight
    const ligandsView = getLigandView(selection);
    if (ligandsView) return;

    const chainId = selection.chainId;
    const chain = getSelectedChain(chains, chainId);
    molstarState.current = MolstarStateActions.setChain(molstarState.current, chainId);

    if (!chain) return;

    try {
        await plugin.visual.select({
            data: [
                {
                    struct_asym_id: chain.chainId,
                    color: "#0000ff",
                    focus,
                },
            ],
            structureNumber: 1, //rooting to the main PDB
            nonSelectedColor: { r: 255, g: 255, b: 255 },
        });
    } catch (err: any) {
        console.error("highlight", err);
    }
}

type LigandView = InitParams["ligandView"];

export function getLigandView(selection: BaseSelection): LigandView | undefined {
    const { chainId, ligandId } = selection;
    if (!chainId || !ligandId) return;
    const [component, position] = ligandId.split("-");
    if (!component || !position) return;

    return {
        auth_asym_id: chainId, //+_1 on previous versions
        auth_seq_id: parseInt(position),
        label_comp_id: component,
    };
}

type MolstarStateRef = React.MutableRefObject<MolstarState>;

function getId<T extends { id: string }>(obj: T): string {
    return obj.id;
}

export async function checkModelUrl(id: Maybe<string>, modelType: Type): Promise<Response> {
    if (!id) return { loaded: true, status: 404 };

    const url = urls[modelType](id);
    //method HEAD makes 404 be 200 anyways
    return await fetch(url, { method: "GET", cache: "force-cache" })
        .then(res => {
            console.debug("Checking model: " + id, res.status);
            return res.ok
                ? { loaded: true, status: res.status }
                : { loaded: false, status: res.status };
        })
        .catch(res => {
            const msg = loaderErrors.pdbRequest(url, res.status);
            console.error(msg);
            return { loaded: false, status: res.status };
        }); //we are only caching if url exist
}

export async function checkUploadedModelUrl(url: string): Promise<Response> {
    return fetch(url, { method: "HEAD", cache: "force-cache" }).then(res => {
        if (res.ok && res.status != 404 && res.status != 500 && res.status != 503)
            return { loaded: true, status: res.status };
        else {
            const msg = loaderErrors.request(url, res.status);
            console.error(msg);
            return { loaded: false, status: res.status };
        }
    });
}

export function getErrorByStatus(id: string, status: number) {
    switch (status) {
        case 404:
            return loaderErrors.modelNotFound(id);
        case 500:
            return loaderErrors.serviceUnavailable(id);
        case 503:
            return loaderErrors.serviceUnavailable(id);
        default:
            return loaderErrors.modelNotFound(id);
    }
}

function errorKeyByStatus(status: number) {
    switch (status) {
        case 404:
            return errorsKeys.modelNotFound;
        case 500:
            return errorsKeys.serviceUnavailable;
        case 503:
            return errorsKeys.serviceUnavailable;
        default:
            return errorsKeys.modelNotFound;
    }
}

type Response = { loaded: boolean; status: number };
