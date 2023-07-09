import { PdbLigand } from "./Pdb";

export interface Protein {
    id: ProteinId;
    name?: string;
    gen?: string;
    organism?: string;
    genBank?: string[];
    nspTargets?: NSPTarget[];
    // nmrSource?: NMRSource[];
}

export interface NSPTarget {
    name: string;
    fragments: NMRFragment[];
    bindingCount: number;
    notBindingCount: number;
}

export interface NMRFragment {
    name: string;
    description: string;
    externalLink: string;
    binding: boolean;
    ligand: PdbLigand;
}

export interface NMRSource {
    dataSource: string;
    name: string; // binding / not binding
    description: string;
    externalLink: string;
    binding: boolean;
}

export type ProteinId = string;

export type ChainId = string;
