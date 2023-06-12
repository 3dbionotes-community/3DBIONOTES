import { PdbId, PdbLigand } from "./Pdb";

export interface Protein {
    id: ProteinId;
    name?: string;
    gen?: string;
    organism?: string;
    genBank?: string[];
    nspTargets?: NSPTarget[];
}

export interface NSPTarget {
    name: string;
    fragments: NMRFragment[];
    bindingCount: number;
    notBindingCount: number;
}

interface NMRFragment {
    name: string;
    description: string;
    externalLink: string;
    pdbentry: PdbId;
    binding: boolean;
    ligand: PdbLigand;
}

export type ProteinId = string;

export type ChainId = string;