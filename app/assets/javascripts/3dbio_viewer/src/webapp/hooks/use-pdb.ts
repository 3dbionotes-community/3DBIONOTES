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
    pdbInfoLoader: LoaderState<PdbInfo>
): [LoaderState<Pdb>, React.Dispatch<React.SetStateAction<LoaderState<Pdb>>>] {
    const { compositionRoot } = useAppContext();
    const [loader, setLoader] = useLoader<Pdb>();
    const pdbInfo = pdbInfoLoader.type === "loaded" ? pdbInfoLoader.data : undefined;

    const pdbId = getMainItem(selection, "pdb");
    const chainId = getChainId(selection);
    const chains = pdbInfo?.chains;
    const pdbOptions: PdbOptions | undefined = React.useMemo(() => {
        return getPdbOptions(pdbId, chainId, chains);
    }, [pdbId, chainId, chains]);

    React.useEffect(() => {
        if (pdbInfoLoader.type === "error") return setLoader(pdbInfoLoader);
        if (!pdbOptions) return;

        setLoader({ type: "loading" });

        return compositionRoot.getPdb.execute(pdbOptions).run(
            pdb => setLoader({ type: "loaded", data: pdb }),
            error => setLoader({ type: "error", message: error.message })
        );
    }, [compositionRoot, setLoader, pdbOptions, pdbInfoLoader]);

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
