import React from "react";
import _ from "lodash";
import { Pdb } from "../../domain/entities/Pdb";
import { PdbInfo } from "../../domain/entities/PdbInfo";
import { PdbOptions } from "../../domain/repositories/PdbRepository";
import { debugVariable } from "../../utils/debug";
import { Maybe } from "../../utils/ts-utils";
import { useAppContext } from "../components/AppContext";
import { LoaderState, useLoader } from "../components/Loader";
import { getChainId, getMainPdbId, getPdbOptions, Selection } from "../view-models/Selection";
import i18n from "../utils/i18n";

export function usePdbLoader(
    selection: Selection,
    pdbInfo: Maybe<PdbInfo>
): LoaderState<Pdb> | undefined {
    const { compositionRoot } = useAppContext();
    const [loader, setLoader] = useLoader<Pdb>();

    const pdbId = getMainPdbId(selection);
    const chainId = getChainId(selection);
    const chains = pdbInfo?.chains;
    const pdbOptions: PdbOptions | undefined = React.useMemo(() => {
        return getPdbOptions(pdbId, chainId, chains);
    }, [pdbId, chainId, chains]);

    React.useEffect(() => {
        if (!pdbOptions) {
            setLoader({
                type: "error",
                message: i18n.t("PDB has no protein"),
            });
            return;
        }
        setLoader({ type: "loading" });

        return compositionRoot.getPdb.execute(pdbOptions).run(
            pdb => setLoader({ type: "loaded", data: pdb }),
            error => setLoader({ type: "error", message: error.message })
        );
    }, [compositionRoot, setLoader, pdbOptions]);

    React.useEffect(() => {
        if (loader.type === "loaded") debugVariable({ pdbData: loader.data });
    }, [loader]);

    return loader;
}
