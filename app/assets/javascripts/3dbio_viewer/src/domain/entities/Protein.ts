export interface Protein {
    id: ProteinId;
    name?: string;
    gene?: string;
    organism?: string;
}

export type ProteinId = string;

export type ChainId = string;
