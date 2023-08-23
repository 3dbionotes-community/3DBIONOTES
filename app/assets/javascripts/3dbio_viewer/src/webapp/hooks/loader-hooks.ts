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

export function useStateFromFuture<Value>(
    getFutureValue: () => FutureData<Value> | undefined
): Value | undefined {
    const [value, setValue] = React.useState<Value>();

    const getValue = React.useCallback(() => {
        return getFutureValue()?.run(setValue, console.error);
    }, [getFutureValue, setValue]);

    React.useEffect(getValue, [getValue]);

    return value;
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

    const pdbInfo = useStateFromFuture(getPdbInfo);

    const pdbInfoWithLigands = React.useMemo(() => {
        return pdbInfo && ligands ? setPdbInfoLigands(pdbInfo, ligands) : pdbInfo;
    }, [pdbInfo, ligands]);

    return { pdbInfo: pdbInfoWithLigands, setLigands };
}

export function useMultipleLoaders<K extends string>(initialState?: Record<K, Loader>) {
    const [loaders, setLoaders] = React.useState<Record<string, Loader>>(initialState ?? {});

    const setLoader = React.useCallback(
        (key: K, loader: Loader) =>
            setLoaders(loaders => ({
                ...loaders,
                [key]: loader,
            })),
        []
    );

    const updateLoaderStatus = React.useCallback(
        (key: K, status: Loader["status"], newMessage?: string) =>
            setLoaders(loaders => {
                const message = newMessage ?? loaders[key]?.message;
                const priority = loaders[key]?.priority;

                return message && priority
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
                    console.debug(`Loader "${key}" error while loading.`);
                    updateLoaderStatus(key, "error");
                    return Promise.reject(err);
                });
        },
        [updateLoaderStatus]
    );

    const loading = React.useMemo(
        () => _.values(loaders).some(({ status }) => status === "loading"),
        [loaders]
    );

    const title = React.useMemo(
        () =>
            _(loaders)
                .values()
                .filter(({ status }) => status === "loading")
                .orderBy(({ priority }) => priority, "desc")
                .first()?.message ?? "",
        [loaders]
    );

    return { loading, title, setLoader, updateLoaderStatus, updateOnResolve };
}

export type LoaderStatus = "pending" | "loading" | "loaded" | "error";

interface Loader {
    status: LoaderStatus;
    message: string;
    priority: number; //the higher the number, the higher the priority
}
