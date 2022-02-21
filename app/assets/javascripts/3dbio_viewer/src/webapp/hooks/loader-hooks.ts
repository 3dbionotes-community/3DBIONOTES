import React from "react";
import { FutureData } from "../../domain/entities/FutureData";
import { Ligand } from "../../domain/entities/Ligand";
import {
    getPdbInfoFromUploadData,
    PdbInfo,
    setPdbInfoLigands,
} from "../../domain/entities/PdbInfo";
import { ProteinNetwork } from "../../domain/entities/ProteinNetwork";
import { UploadData } from "../../domain/entities/UploadData";
import { Future } from "../../utils/future";
import { Maybe } from "../../utils/ts-utils";
import { useAppContext } from "../components/AppContext";
import { getMainPdbId, Selection } from "../view-models/Selection";

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

export function usePdbInfo(
    selection: Selection,
    uploadData: Maybe<UploadData>,
    proteinNetwork: Maybe<ProteinNetwork>
) {
    const { compositionRoot } = useAppContext();
    const mainPdbId = getMainPdbId(selection);
    const [ligands, setLigands] = React.useState<Ligand[]>();

    const getPdbInfo = React.useCallback((): Maybe<FutureData<PdbInfo>> => {
        if (mainPdbId) {
            return compositionRoot.getPdbInfo.execute(mainPdbId);
        } else if (uploadData) {
            return Future.success(getPdbInfoFromUploadData(uploadData));
        } else if (proteinNetwork) {
            return Future.success(getPdbInfoFromUploadData(proteinNetwork.uploadData));
        }
    }, [mainPdbId, compositionRoot, uploadData, proteinNetwork]);

    const pdbInfo = useStateFromFuture(getPdbInfo);

    const pdbInfoWithLigands = React.useMemo(() => {
        return pdbInfo && ligands ? setPdbInfoLigands(pdbInfo, ligands) : pdbInfo;
    }, [pdbInfo, ligands]);

    return { pdbInfo: pdbInfoWithLigands, setLigands };
}
