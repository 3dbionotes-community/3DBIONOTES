import React from "react";
import { FutureData } from "../../domain/entities/FutureData";
import { Ligand } from "../../domain/entities/Ligand";
import { setPdbInfoLigands } from "../../domain/entities/PdbInfo";
import { useAppContext } from "../components/AppContext";
import { getMainPdbId, Selection } from "../view-models/Selection";
import { useCallbackEffect } from "./use-callback-effect";

export function useStateFromFuture<Value>(
    getFutureValue: () => FutureData<Value> | undefined
): Value | undefined {
    const [value, setValue] = React.useState<Value>();

    const getValue = React.useCallback(() => {
        return getFutureValue()?.run(setValue, console.error);
    }, [getFutureValue, setValue]);

    const getValueCancellable = useCallbackEffect(getValue);

    React.useEffect(getValueCancellable, [getValueCancellable]);

    return value;
}

export function usePdbInfo(selection: Selection) {
    const { compositionRoot } = useAppContext();
    const mainPdbId = getMainPdbId(selection);
    const [ligands, setLigands] = React.useState<Ligand[]>();

    const getPdbInfo = React.useCallback(() => {
        return mainPdbId ? compositionRoot.getPdbInfo.execute(mainPdbId) : undefined;
    }, [mainPdbId, compositionRoot]);

    const pdbInfo = useStateFromFuture(getPdbInfo);

    const pdbInfoWithLigands = React.useMemo(() => {
        return pdbInfo && ligands ? setPdbInfoLigands(pdbInfo, ligands) : pdbInfo;
    }, [pdbInfo, ligands]);

    return { pdbInfo: pdbInfoWithLigands, setLigands };
}
