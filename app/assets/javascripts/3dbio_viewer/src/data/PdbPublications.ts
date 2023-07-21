import { Codec, GetType, array, nullType, number, string } from "purify-ts";
import { maybe } from "./PdbLigands";
import { PdbPublication } from "../domain/entities/Pdb";

export const publicationsCodec = array(
    //using so many "maybe" from examples: 7O7Z, 6ABA, 7SUB
    //but truly I don't want to use them so often. Check with JR
    //9zzz will return {}
    Codec.interface({
        doi: maybe(string),
        title: string,
        pubmed_id: maybe(string),
        type: string,
        associated_entries: maybe(string),
        journal_info: Codec.interface({
            pdb_abbreviation: maybe(string),
            ISO_abbreviation: maybe(string),
            pages: maybe(string),
            volume: maybe(string),
            issue: maybe(string),
            year: maybe(number),
        }),
        abstract: Codec.interface({
            background: nullType,
            objective: nullType,
            methods: nullType,
            results: nullType,
            conclusions: nullType,
            unassigned: maybe(string),
        }),
        author_list: array(
            Codec.interface({
                full_name: string,
                last_name: maybe(string),
                initials: maybe(string),
            })
        ),
    })
);

export function getPublicationsCodec(pdbId: string): Codec<EntryPublications> {
    return Codec.interface({
        [pdbId]: publicationsCodec,
    });
}

export type EntryPublications = {
    [x: string]: PublicationsCodec;
};

type PublicationsCodec = GetType<typeof publicationsCodec>;

export function getPublications(publications: PublicationsCodec): PdbPublication[] {
    return publications.map(
        ({
            title,
            type,
            doi,
            pubmed_id,
            associated_entries,
            journal_info,
            abstract,
            author_list,
        }) => {
            return {
                title,
                type,
                doi: doi ?? undefined,
                pubmedId: pubmed_id ?? undefined,
                associatedEntries: associated_entries?.split(", ") ?? [],
                journalInfo: {
                    pdbAbbreviation: journal_info.pdb_abbreviation ?? undefined,
                    isoAbbreviation: journal_info.ISO_abbreviation ?? undefined,
                    pages: journal_info.pages ?? undefined,
                    volume: journal_info.volume ?? undefined,
                    issue: journal_info.issue ?? undefined,
                    year: journal_info.year ?? undefined,
                },
                abstract: {
                    unassigned: abstract.unassigned ?? undefined,
                },
                authors: author_list.map(author => author.full_name),
            };
        }
    );
}
