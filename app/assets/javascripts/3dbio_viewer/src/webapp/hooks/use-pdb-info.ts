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
import { LoaderState } from "../components/Loader";
import { useStateFromFuture } from "./loader-hooks";

export function usePdbInfoLoader(args: {
    selection: Selection;
    uploadData: Maybe<UploadData>;
    onProcessDelay: (reason: string) => void;
}) {
    const { selection, uploadData, onProcessDelay } = args;
    const { compositionRoot } = useAppContext();
    const mainPdbId = getMainItem(selection, "pdb");
    const [ligands, setLigands] = React.useState<Ligand[]>();

    const getPdbInfo = React.useCallback((): Maybe<FutureData<PdbInfo>> => {
        if (mainPdbId) {
            return compositionRoot.getPdbInfo.execute({ pdbId: mainPdbId, onProcessDelay });
        } else if (uploadData) {
            return Future.success(getPdbInfoFromUploadData(uploadData));
        }
    }, [mainPdbId, compositionRoot, uploadData, onProcessDelay]);

    const pdbInfoLoader = useStateFromFuture(getPdbInfo);

    const pdbInfoWithLigandsLoader = React.useMemo((): LoaderState<PdbInfo> => {
        return pdbInfoLoader.type === "loaded" && ligands
            ? { type: "loaded", data: setPdbInfoLigands(pdbInfoLoader.data, ligands) }
            : pdbInfoLoader;
    }, [pdbInfoLoader, ligands]);

    return { pdbInfoLoader: pdbInfoWithLigandsLoader, setLigands };
}
