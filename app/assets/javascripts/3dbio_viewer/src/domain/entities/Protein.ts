import { PdbLigand } from "./Pdb";

export interface Protein {
    id: ProteinId;
    name?: string;
    gen?: string;
    organism?: string;
    genBank?: string[];
}

export interface NMRTarget {
    name: string;
    uniprotId: string;
    start: number;
    end: number;
}

export interface BasicNMRFragmentTarget {
    uniprotId: string;
    start: number;
    end: number;
}

export interface NMRFragmentTarget extends BasicNMRFragmentTarget {
    name: string;
    fragments: NMRFragment[];
    bindingCount: number;
    notBindingCount: number;
}

export interface NMRFragment {
    name: string;
    binding: boolean;
    ligand: PdbLigand;
}

export type ProteinId = string;

export type ChainId = string;
