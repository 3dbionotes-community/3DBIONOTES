import React from "react";
import _ from "lodash";
import { Pdb, PdbId } from "../../domain/entities/Pdb";
import { PdbInfo } from "../../domain/entities/PdbInfo";
import { PdbOptions } from "../../domain/repositories/PdbRepository";
import { Maybe } from "../../utils/ts-utils";
import { useAppContext } from "../components/AppContext";
import { LoaderState, useLoader } from "../components/Loader";
import { getChainId, getMainItem, Selection } from "../view-models/Selection";

export function usePdbLoader(
    selection: Selection,
    pdbInfo: Maybe<PdbInfo>
): [LoaderState<Pdb>, React.Dispatch<React.SetStateAction<LoaderState<Pdb>>>] {
    const { compositionRoot } = useAppContext();
    const [loader, setLoader] = useLoader<Pdb>();

    const pdbId = getMainItem(selection, "pdb");
    const chainId = getChainId(selection);
    const chains = pdbInfo?.chains;
    const pdbOptions: PdbOptions | undefined = React.useMemo(() => {
        return getPdbOptions(pdbId, chainId, chains);
    }, [pdbId, chainId, chains]);

    React.useEffect(() => {
        if (!pdbOptions) return;
        setLoader({ type: "loading" });

        return compositionRoot.getPdb.execute(pdbOptions).run(
            pdb => setLoader({ type: "loaded", data: pdb }),
            error => setLoader({ type: "error", message: error.message })
        );
    }, [compositionRoot, setLoader, pdbOptions]);

    return [loader, setLoader];
}

export function getPdbOptions(
    pdbId: Maybe<PdbId>,
    chainId: Maybe<string>,
    chains: Maybe<PdbInfo["chains"]>
): Maybe<PdbOptions> {
    if (!chains) return;

    const defaultChain = chains[0];
    const chain = chainId
        ? _(chains)
              .keyBy(chain => chain.chainId)
              .get(chainId, defaultChain)
        : defaultChain;

    return chain ? { pdbId, proteinId: chain.protein.id, chainId: chain.chainId } : undefined;
}
