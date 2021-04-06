import React from "react";
import { Pdb } from "../../domain/entities/Pdb";
import { PdbOptions } from "../../domain/repositories/PdbRepository";
import { debugVariable } from "../../utils/debug";
import { throwError } from "../../utils/misc";
import { useAppContext } from "../components/AppContext";
import { useLoader } from "../components/Loader";
import { SelectionState } from "../view-models/SelectionState";

const examples: Record<string, PdbOptions> = {
    "6zow": { protein: "P0DTC2", pdb: "6zow", chain: "A" },
    "6lzg": { protein: "Q9BYF1", pdb: "6lzg", chain: "A" }, // Smart, Disordered regions
    "6w9c": { protein: "P0DTD1", pdb: "6w9c", chain: "A" },
    "1iyj": { protein: "P60896", pdb: "1iyj", chain: "A" },
    "2r5t": { protein: "O00141", pdb: "2r5t", chain: "A" }, // Kinenasa
    "2z62": { protein: "O00206", pdb: "2z62", chain: "A" }, // InterPro
};

export function usePdbLoader(selection: SelectionState) {
    const { compositionRoot } = useAppContext();
    const [loader, setLoader] = useLoader<Pdb>();
    const pdbId = selection.main?.pdb.id || "";
    const pdbOptions = examples[pdbId.toLowerCase()];
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
