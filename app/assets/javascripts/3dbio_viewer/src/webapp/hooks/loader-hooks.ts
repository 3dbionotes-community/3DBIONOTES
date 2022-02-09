import React from "react";
import { FutureData } from "../../domain/entities/FutureData";
import { Ligand } from "../../domain/entities/Ligand";
import { PdbInfo, setPdbInfoLigands } from "../../domain/entities/PdbInfo";
import { UploadData } from "../../domain/entities/UploadData";
import { Future } from "../../utils/future";
import { Maybe } from "../../utils/ts-utils";
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

export function usePdbInfo(selection: Selection, uploadData: Maybe<UploadData>) {
    const { compositionRoot } = useAppContext();
    const mainPdbId = getMainPdbId(selection);
    const [ligands, setLigands] = React.useState<Ligand[]>();

    const getPdbInfo = React.useCallback(() => {
        if (mainPdbId) {
            return compositionRoot.getPdbInfo.execute(mainPdbId);
        } else if (uploadData) {
            const pdbInfo: PdbInfo = {
                id: undefined,
                emdbs: [],
                chains: uploadData.chains.map(chain => {
                    return {
                        id: chain.chain,
                        name: chain.name,
                        shortName: chain.name,
                        chainId: chain.chain,
                        protein: {
                            id: chain.uniprot,
                            name: chain.uniprotTitle,
                            gene: chain.gene_symbol,
                            organism: chain.organism,
                        },
                    };
                }),
                ligands: [],
            };
            return Future.success(pdbInfo) as FutureData<PdbInfo>;
        }
    }, [mainPdbId, compositionRoot, uploadData]);

    const pdbInfo = useStateFromFuture(getPdbInfo);

    const pdbInfoWithLigands = React.useMemo(() => {
        return pdbInfo && ligands ? setPdbInfoLigands(pdbInfo, ligands) : pdbInfo;
    }, [pdbInfo, ligands]);

    return { pdbInfo: pdbInfoWithLigands, setLigands };
}
