import { DbModelCollection, DbModelType } from "../entities/DbModel";
import { FutureData } from "../entities/FutureData";
import { EmdbId, PdbId } from "../entities/Pdb";

export interface DbModelRepository {
    search(options: SearchOptions): FutureData<DbModelCollection>;
    getEmdbsFromPdb(pdbId: PdbId): FutureData<EmdbId[]>;
    getPdbsFromEmdb(emdbId: EmdbId): FutureData<PdbId[]>;
}

export interface SearchOptions {
    query: string;
    type?: DbModelType;
}
