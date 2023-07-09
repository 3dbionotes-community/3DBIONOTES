import { Codec, GetType, array, nullType, number, string } from "purify-ts";
import { maybe } from "./PdbLigands";
import { PdbPublication } from "../domain/entities/Pdb";
import { Maybe } from "../utils/ts-utils";

export const publicationsCodec = array(
    Codec.interface({
        //maybe ref from examples: 7O7Z, 6ABA, 7SUB
        //9zzz will return {}
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
    [x: string]: GetType<typeof publicationsCodec>;
};

export function getPublication(entryPublications: EntryPublications): PdbPublication[] {
    const key = Object.keys(entryPublications)[0];
    if (!key) return [];
    const entries = entryPublications[key];
    if (!entries) return [];

    return entries.map(
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
                doi,
                pubmedId: pubmed_id,
                associatedEntries: associated_entries,
                journalInfo: undefined,
                abstract: undefined,
                authorList: undefined,
            };
        }
    );
}
