export interface Protein {
    id: ProteinId;
    name?: string;
    gen?: string;
    organism?: string;
    genBank?: string[];
}

export type ProteinId = string;

export type ChainId = string;
