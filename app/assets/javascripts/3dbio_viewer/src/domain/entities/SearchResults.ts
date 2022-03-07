import { DbModel } from "./DbModel";

export interface SearchResults {
    query: string;
    items: DbModel[];
    totals: { pdb: number; emdb: number };
}
