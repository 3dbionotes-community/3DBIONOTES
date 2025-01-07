import { PdbLigand } from "./Pdb";
import { Link } from "./Link";

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
export type StructAsymId = string;

type ProteinEntity = "uniprot" | "geneBank";

export function getProteinEntityLinks(protein: Protein, entity: ProteinEntity): Link[] {
    switch (entity) {
        case "uniprot": {
            const proteinId = protein.id.toUpperCase();
            return [{ name: proteinId, url: `https://www.uniprot.org/uniprot/${proteinId}` }];
        }
        case "geneBank": {
            return protein.genBank
                ? protein.genBank?.map(id => ({
                      name: id ?? "-",
                      url: `https://www.ncbi.nlm.nih.gov/gene/${id}`,
                  }))
                : [];
        }
    }
}
