import { Protein } from "../../../domain/entities/Protein";

export interface UniprotResponse {
    uniprot: {
        entry: Array<{
            accession: string[];
            name: string[];
            protein: Array<{
                recommendedName: Array<{
                    fullName: Array<{ _: string }>;
                }>;
            }>;
        }>;
    };
}

const unknown = "unknown";

export function getProtein(res: UniprotResponse | undefined): Protein {
    const entry = res?.uniprot.entry[0];
    if (!entry) return unknownProtein;

    const accession = entry.accession[0];
    const name = entry.name[0];

    return {
        id: accession || unknown,
        name: name || unknown,
    };
}

const unknownProtein: Protein = {
    id: unknown,
    name: unknown,
};
