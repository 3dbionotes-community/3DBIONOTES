import _ from "lodash";
import { Maybe } from "../../utils/ts-utils";
import { Ligand } from "./Ligand";
import { Emdb } from "./Pdb";
import { ChainId, Protein, ProteinId } from "./Protein";

export interface PdbInfo {
    id: Maybe<string>;
    emdbs: Emdb[];
    chains: Array<{
        id: string;
        name: string;
        shortName: string;
        chainId: ChainId;
        protein: Protein;
    }>;
    ligands: Ligand[];
}

interface BuildPdbInfoOptions extends Omit<PdbInfo, "chains"> {
    proteins: Protein[];
    proteinsMapping: Record<ProteinId, ChainId[]>;
}

export function buildPdbInfo(options: BuildPdbInfoOptions): PdbInfo {
    const proteinById = _.keyBy(options.proteins, protein => protein.id);
    const chains = _(options.proteinsMapping)
        .toPairs()
        .flatMap(([proteinId, chainIds]) => {
            const protein = proteinById[proteinId];
            if (!protein) return [];

            return chainIds.map(chainId => {
                const shortName = _([chainId, protein.gene]).compact().join(" - ");
                return {
                    id: [proteinId, chainId].join("-"),
                    shortName,
                    name: _([shortName, protein.name]).compact().join(", "),
                    chainId,
                    protein,
                };
            });
        })
        .sortBy(obj => obj.chainId)
        .value();

    return { ...options, chains };
}

export function setPdbInfoLigands(pdbInfo: PdbInfo, newLigands: PdbInfo["ligands"]): PdbInfo {
    return { ...pdbInfo, ligands: newLigands };
}
