import { Protein } from "../../../domain/entities/Protein";
import _ from "lodash";

/*
    <uniprot xmlns="http://uniprot.org/uniprot"
             xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
             xsi:schemaLocation="http://uniprot.org/uniprot http://www.uniprot.org/support/docs/uniprot.xsd">
        <entry dataset="Swiss-Prot" created="2020-04-22" modified="2021-02-10" version="6">
            <accession>P0DTC2</accession>
            <name>SPIKE_SARS2</name>
            <protein>
                <recommendedName>
                    <fullName evidence="24">Spike glycoprotein</fullName>
                    <shortName evidence="24">S glycoprotein</shortName>
                </recommendedName>
            </protein>
            <gene>
                <name type="primary" evidence="24">S</name>
                <name type="ORF">2</name>
            </gene>
        </entry>
    </uniprot>
*/
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
            gene: Array<{
                name: Array<{ $: { type: "primary" | "ORF" }; _: string }>;
            }>;
            organism: Array<{
                name: Array<{ _: string }>;
            }>;
        }>;
    };
}

export function getProtein(id: string, res: UniprotResponse | undefined): Protein {
    const entry = res?.uniprot.entry[0];
    if (!entry) return { id };

    const name = entry.protein[0]?.recommendedName[0]?.fullName[0]?._;
    const geneEntries = entry.gene[0]?.name || [];
    const geneEntry = entry.gene[0]?.name.find(g => g.$.type === "primary") || geneEntries[0];
    const organismEntries = _.compact(entry.organism[0]?.name.map(x => x._));

    const organism = [
        ..._.take(organismEntries, 1),
        ...organismEntries.slice(1).map(s => `(${s})`),
    ].join(" ");

    const gene = geneEntry ? geneEntry._ : undefined;

    return { id, name, gene, organism };
}
