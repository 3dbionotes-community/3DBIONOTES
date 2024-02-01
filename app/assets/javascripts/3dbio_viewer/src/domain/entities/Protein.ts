import { Link } from "./Link";

export interface Protein {
    id: ProteinId;
    name?: string;
    gen?: string;
    organism?: string;
    genBank?: string[];
}

export type ProteinId = string;

export type ChainId = string;

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