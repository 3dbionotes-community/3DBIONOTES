export interface Protein {
    id: ProteinId;
    name: string;
    gene: string;
    organism: string;
}

export const emptyProtein = {
    id: "",
    name: "-",
    gene: "-",
    organism: "-",
};

export type ProteinId = string;

export type ChainId = string;
