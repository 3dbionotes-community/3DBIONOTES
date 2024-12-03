import _ from "lodash";
import { Maybe } from "../../utils/ts-utils";
import { Ligand } from "./Ligand";
import { Emdb } from "./Pdb";
import { ChainId, Protein } from "./Protein";
import { UploadData } from "./UploadData";
import { MappingChain } from "../../data/repositories/BionotesPdbInfoRepository";

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
    structAsymId: string;
    protein: Maybe<Protein>;
};

interface BuildPdbInfoOptions {
    id: Maybe<string>;
    emdbs: Emdb[];
    ligands: Ligand[];
    proteins: Protein[];
    chainsMappings: MappingChain[];
}

export function buildPdbInfo(options: BuildPdbInfoOptions): PdbInfo {
    const chains = _(options.chainsMappings)
        .map(({ protein: proteinId, structAsymId, chainId }) => {
            const protein = options.proteins.find(({ id }) => proteinId === id);

            if (!protein)
                return {
                    id: chainId,
                    shortName: structAsymId,
                    name: `${structAsymId} [auth ${chainId}]`,
                    chainId: chainId,
                    structAsymId: structAsymId,
                    protein: undefined,
                };

            const name = `${structAsymId} [auth ${chainId}]`;
            const shortName = _([structAsymId, protein.gen]).compact().join(" - ");

            return {
                id: chainId,
                shortName,
                name: _([_([name, protein.gen]).compact().join(" - "), protein.name])
                    .compact()
                    .join(", "),
                chainId: chainId,
                structAsymId: structAsymId,
                protein,
            };
        })
        .sortBy(obj => obj.structAsymId)
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
                chainId: chain.chain, //THIS MUST BE AKNOLWEDGED
                structAsymId: chain.chain, //THIS MUST BE AKNOLWEDGED
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
