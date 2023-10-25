import _ from "lodash";
import { Protein } from "../../../domain/entities/Protein";

/* Example: https://www.uniprot.org/uniprot/Q9BYF1.xml */

export interface UniprotResponse {
    uniprot: {
        entry: Array<{
            accession: string[];
            name: string[];
            protein?: Array<{
                recommendedName?: Array<{
                    fullName?: Array<{ _: string } | string>;
                }>;
            }>;
            gene?: Array<{
                name: Array<{ $: { type: "primary" | "ORF" }; _: string }>;
            }>;
            organism?: Array<{
                name: Array<{ _: string }>;
            }>;
            dbReference?: Array<{ $: { type: string; id: string } }>;
        }>;
    };
}

export function getProtein(proteinId: string, res: UniprotResponse | undefined): Protein {
    const entry = res?.uniprot.entry[0];
    if (!entry) return { id: proteinId, nspTargets: [] };

    const tempName = entry.protein?.[0]?.recommendedName?.[0]?.fullName?.[0];
    const name = typeof tempName === "string" ? tempName : tempName?._;
    const geneEntries = entry.gene?.[0]?.name || [];
    const genEntry = entry.gene?.[0]?.name.find(g => g.$.type === "primary") || geneEntries[0];
    const organismEntries = _.compact(entry.organism?.[0]?.name.map(x => x._));
    const genBank = entry.dbReference?.filter(({ $ }) => $.type === "GeneID").map(g => g.$.id);

    const organism = [
        ..._.take(organismEntries, 1),
        ...organismEntries.slice(1).map(s => `(${s})`),
    ].join(" ");

    const gen = genEntry ? genEntry._ : undefined;

    return { id: proteinId, name, gen, organism, genBank, nspTargets: [] };
}
