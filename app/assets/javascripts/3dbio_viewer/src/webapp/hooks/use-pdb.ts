import React from "react";
import _ from "lodash";
import { Pdb, PdbId } from "../../domain/entities/Pdb";
import { PdbInfo } from "../../domain/entities/PdbInfo";
import { PdbOptions } from "../../domain/repositories/PdbRepository";
import { Maybe } from "../../utils/ts-utils";
import { useAppContext } from "../components/AppContext";
import { LoaderState, useLoader } from "../components/Loader";
import { getChainId, getMainItem, Selection } from "../view-models/Selection";
import i18n from "../utils/i18n";

export function usePdbLoader(
    selection: Selection,
    pdbInfoLoader: LoaderState<PdbInfo>
): [LoaderState<Pdb>, React.Dispatch<React.SetStateAction<LoaderState<Pdb>>>] {
    const { compositionRoot } = useAppContext();
    const [loader, setLoader] = useLoader<Pdb>();

    const pdbInfo = React.useMemo(
        () => (pdbInfoLoader.type === "loaded" ? pdbInfoLoader.data : undefined),
        [pdbInfoLoader]
    );

    const pdbId = React.useMemo(() => getMainItem(selection, "pdb"), [selection]);
    const chainId = getChainId(selection);
    const chains = pdbInfo?.chains;

    const pdbOptions: PdbOptions | undefined = React.useMemo(() => {
        if (!pdbId) return;
        return getPdbOptions(pdbId, chainId, chains);
    }, [pdbId, chainId, chains]);

    const pdbInfoLoaderMessage = pdbInfoLoader.type === "error" ? pdbInfoLoader.message : undefined;

    React.useEffect(() => setLoader({ type: "loading" }), [pdbId, setLoader]);

    React.useEffect(() => {
        if (pdbInfoLoader.type === "error" && pdbInfoLoaderMessage)
            setLoader({ type: "error", message: pdbInfoLoaderMessage });
        if (pdbInfoLoader.type === "loaded" && !pdbOptions)
            setLoader({
                type: "error",
                message: i18n.t(
                    "No chains found for this PDB. Therefore we are unable to retrieve any data."
                ),
                //This shouldn't be happening and btw EMDB can be present, so is very possible to have something at least to show...
            });
        if (!pdbOptions) return;
        setLoader({ type: "loading" });
        return compositionRoot.getPdb.execute(pdbOptions).run(
            pdb => setLoader({ type: "loaded", data: pdb }),
            error => setLoader({ type: "error", message: error.message })
        );
    }, [compositionRoot, setLoader, pdbOptions, pdbInfoLoader.type, pdbInfoLoaderMessage]);
    //Do not add pdbInfoLoader as dependency as .ligands will update. Making the loading screen show again (╥_╥)

    return [loader, setLoader];
}

export function getPdbOptions(
    pdbId: PdbId,
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

    return chain
        ? {
              pdbId,
              proteinId: chain.protein?.id,
              chainId: chain.chainId,
              structAsymId: chain.structAsymId,
          }
        : undefined;
}
