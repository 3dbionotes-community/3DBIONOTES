export interface Protein {
    id: ProteinId;
    name?: string;
    gene?: string;
    organism?: string;
    geneBank?: string[];
}

export type ProteinId = string;

export type ChainId = string;
