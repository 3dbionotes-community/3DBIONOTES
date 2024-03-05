import _ from "lodash";
import { Maybe } from "../../utils/ts-utils";
import { Ligand } from "./Ligand";
import { Emdb } from "./Pdb";
import { ChainId, Protein } from "./Protein";
import { UploadData } from "./UploadData";

export interface PdbInfo {
    id: Maybe<string>;
    emdbs: Emdb[];
    chains: Chain[];
    ligands: Ligand[];
}
type Chain = {
    id: string;
    name: string;
    shortName: string;
    chainId: ChainId;
    protein: Maybe<Protein>;
};

type ChainIds = {
    structAsymId: string;
    chainId: string;
};

interface BuildPdbInfoOptions extends PdbInfo {
    proteins: Protein[];
    proteinsMapping: Maybe<Record<string, ChainIds[]>>;
}

export function buildPdbInfo(options: BuildPdbInfoOptions): PdbInfo {
    if (!options.proteinsMapping && _.isEmpty(options.proteins)) return options;
    const proteinById = _.keyBy(options.proteins, protein => protein.id);
    const chains = _(options.proteinsMapping)
        .toPairs()
        .flatMap(([proteinId, chainIds]) => {
            const protein = proteinById[proteinId];
            if (!protein) return [];

            return chainIds.map(({ structAsymId, chainId: _chainId }) => {
                const shortName = _([structAsymId, protein.gen]).compact().join(" - ");
                return {
                    id: [proteinId, structAsymId].join("-"),
                    shortName,
                    name: _([shortName, protein.name]).compact().join(", "),
                    chainId: structAsymId,
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

export function getPdbInfoFromUploadData(uploadData: UploadData): PdbInfo {
    return {
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
}
