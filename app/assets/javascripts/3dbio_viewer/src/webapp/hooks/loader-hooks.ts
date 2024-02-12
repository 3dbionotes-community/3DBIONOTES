import _ from "lodash";
import React from "react";
import {
    getPdbInfoFromUploadData,
    PdbInfo,
    setPdbInfoLigands,
} from "../../domain/entities/PdbInfo";
import { FutureData } from "../../domain/entities/FutureData";
import { Ligand } from "../../domain/entities/Ligand";
import { UploadData } from "../../domain/entities/UploadData";
import { Future } from "../../utils/future";
import { Maybe } from "../../utils/ts-utils";
import { useAppContext } from "../components/AppContext";
import { getMainItem, Selection } from "../view-models/Selection";
import i18n from "../utils/i18n";
import { LoaderState, useLoader } from "../components/Loader";

export function useStateFromFuture<Value>(
    getFutureValue: () => FutureData<Value> | undefined
): LoaderState<Value> {
    const [loader, setLoader] = useLoader<Value>();

    const getValue = React.useCallback(() => {
        return getFutureValue()?.run(
            value => {
                setLoader({ type: "loaded", data: value });
            },
            err => {
                console.error(err);
                setLoader({ type: "error", message: err.message });
            }
        );
    }, [getFutureValue, setLoader]);

    React.useEffect(getValue, [getValue]);

    return loader;
}

export function usePdbInfo(selection: Selection, uploadData: Maybe<UploadData>) {
    const { compositionRoot } = useAppContext();
    const mainPdbId = getMainItem(selection, "pdb");
    const [ligands, setLigands] = React.useState<Ligand[]>();

    const getPdbInfo = React.useCallback((): Maybe<FutureData<PdbInfo>> => {
        if (mainPdbId) {
            return compositionRoot.getPdbInfo.execute(mainPdbId);
        } else if (uploadData) {
            return Future.success(getPdbInfoFromUploadData(uploadData));
        }
    }, [mainPdbId, compositionRoot, uploadData]);

    const pdbInfoLoader = useStateFromFuture(getPdbInfo);

    const pdbInfoWithLigandsLoader = React.useMemo((): LoaderState<PdbInfo> => {
        return pdbInfoLoader.type === "loaded" && ligands
            ? { type: "loaded", data: setPdbInfoLigands(pdbInfoLoader.data, ligands) }
            : pdbInfoLoader;
    }, [pdbInfoLoader, ligands]);

    return { pdbInfoLoader: pdbInfoWithLigandsLoader, setLigands };
}

export function useMultipleLoaders<K extends string>(initialState: MultipleLoader<K>) {
    const [loaders, setLoaders] = React.useState<MultipleLoader<K>>(initialState);

    const setLoader = React.useCallback(
        (key: K, loader: Loader) =>
            setLoaders(loaders => ({
                ...loaders,
                [key]: loader,
            })),
        []
    );

    const resetLoaders = React.useCallback(
        (state: MultipleLoader<K>) => setLoaders(state),
        []
    );

    const updateLoaderStatus = React.useCallback(
        (key: K, status: Loader["status"], newMessage?: string) =>
            setLoaders(loaders => {
                const prevStatus = loaders[key]?.status;
                if (prevStatus === status) return loaders;

                const message = newMessage ?? loaders[key]?.message;
                const priority = loaders[key]?.priority ?? 0;

                return message
                    ? {
                        ...loaders,
                        [key]: {
                            message,
                            status,
                            priority,
                        },
                    }
                    : loaders;
            }),
        []
    );

    const updateOnResolve = React.useCallback(
        <T>(key: K, promise: Promise<T>, message?: string) => {
            updateLoaderStatus(key, "loading", message);
            return promise
                .then(data => {
                    console.debug(`Loader "${key}" loaded.`);
                    updateLoaderStatus(key, "loaded");
                    return data;
                })
                .catch(err => {
                    console.error(`Loader "${key}": error while loading.`);
                    updateLoaderStatus(key, "error", err);
                    return Promise.reject(err);
                });
        },
        [updateLoaderStatus]
    );

    const loading = React.useMemo(
        () => _.values<Loader>(loaders).some(loader => loader.status === "loading"),
        [loaders]
    );

    const errorThrown = React.useMemo(
        () => _.values<Loader>(loaders).some(loader => loader.status === "error"),
        [loaders]
    );

    const title = React.useMemo(
        () =>
            _(loaders)
                .values()
                .filter(({ status }) => status === "loading")
                .orderBy(({ priority }) => priority, "desc")
                .first()?.message ?? i18n.t("Loading..."),
        [loaders]
    );

    return {
        loading,
        errorThrown,
        title,
        setLoader,
        updateLoaderStatus,
        updateOnResolve,
        loaders,
        resetLoaders,
    };
}

export type LoaderStatus = "pending" | "loading" | "loaded" | "error";

interface Loader {
    status: LoaderStatus;
    message: string;
    priority: number; //the higher the number, the higher the priority
}

type MultipleLoader<K extends string> = Record<K, Loader>;
