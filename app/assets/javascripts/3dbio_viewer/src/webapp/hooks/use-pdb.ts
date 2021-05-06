import React from "react";
import { Pdb } from "../../domain/entities/Pdb";
import { PdbOptions } from "../../domain/repositories/PdbRepository";
import { debugVariable } from "../../utils/debug";
import { useAppContext } from "../components/AppContext";
import { LoaderState, useLoader } from "../components/Loader";
import { Selection } from "../view-models/Selection";

const proteinFromPdbId: Record<string, string> = {
    "6zow": "P0DTC2",
    "6lzg": "Q9BYF1",
    "6w9c": "P0DTD1",
    "1iyj": "P60896",
    "2r5t": "O00141",
    "2z62": "O00206",
    "3brv": "O14920",
    "1yyb": "O14737",
    "7bv1": "P0DTD1",
};

export function usePdbLoader(selection: Selection): LoaderState<Pdb> | undefined {
    const { compositionRoot } = useAppContext();
    const [loader, setLoader] = useLoader<Pdb>();
    const pdbId = selection.main.pdb?.id;

    const pdbOptions: PdbOptions | undefined = React.useMemo(() => {
        if (!pdbId) return;
        const protein = proteinFromPdbId[pdbId.toLowerCase()];
        return protein ? { pdb: pdbId, protein, chain: "A" } : undefined;
    }, [pdbId]);

    React.useEffect(() => {
        if (!pdbOptions) {
            setLoader({ type: "error", message: `PDB not configured in use-pdb: ${pdbId || "-"}` });
            return;
        }
        setLoader({ type: "loading" });

        return compositionRoot.getPdb.execute(pdbOptions).run(
            pdb => setLoader({ type: "loaded", data: pdb }),
            error => setLoader({ type: "error", message: error.message })
        );
    }, [compositionRoot, setLoader, pdbOptions, pdbId]);

    React.useEffect(() => {
        if (loader.type === "loaded") debugVariable({ pdbData: loader.data });
    }, [loader]);

    return loader;
}
