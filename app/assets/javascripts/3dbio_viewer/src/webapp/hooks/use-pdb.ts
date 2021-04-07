import React from "react";
import { Pdb } from "../../domain/entities/Pdb";
import { PdbOptions } from "../../domain/repositories/PdbRepository";
import { debugVariable } from "../../utils/debug";
import { throwError } from "../../utils/misc";
import { useAppContext } from "../components/AppContext";
import { useLoader } from "../components/Loader";
import { SelectionState } from "../view-models/SelectionState";

const proteinFromPdbId: Record<string, string> = {
    "6zow": "P0DTC2",
    "6lzg": "Q9BYF1",
    "6w9c": "P0DTD1",
    "1iyj": "P60896",
    "2r5t": "O00141",
    "2z62": "O00206",
    "3brv": "O14920",
};

export function usePdbLoader(selection: SelectionState) {
    const { compositionRoot } = useAppContext();
    const [loader, setLoader] = useLoader<Pdb>();
    const pdbId = (selection.main?.pdb.id || "6zow").toLowerCase();
    const pdbOptions: PdbOptions = React.useMemo(() => {
        const protein = proteinFromPdbId[pdbId] || "P0DTC2";
        return { pdb: pdbId, protein, chain: "A" };
    }, [pdbId]);
    if (!pdbOptions) throwError(`PDB not defined: ${pdbId}`);

    React.useEffect(() => {
        setLoader({ type: "loading" });

        return compositionRoot.getPdb(pdbOptions).run(
            pdb => setLoader({ type: "loaded", data: pdb }),
            error => setLoader({ type: "error", message: error.message })
        );
    }, [compositionRoot, setLoader, pdbOptions]);

    React.useEffect(() => {
        if (loader.type === "loaded") debugVariable({ pdbData: loader.data });
    }, [loader]);

    return loader;
}
