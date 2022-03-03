import { DbModelType } from "../entities/DbModel";
import { FutureData } from "../entities/FutureData";
import { EmdbId, PdbId } from "../entities/Pdb";
import { SearchResults } from "../entities/SearchResults";

export interface DbModelRepository {
    search(options: SearchOptions): FutureData<SearchResults>;
    getEmdbsFromPdb(pdbId: PdbId): FutureData<EmdbId[]>;
    getPdbsFromEmdb(emdbId: EmdbId): FutureData<PdbId[]>;
}

export interface SearchOptions {
    query: string;
    type?: DbModelType;
    limit: number;
}
