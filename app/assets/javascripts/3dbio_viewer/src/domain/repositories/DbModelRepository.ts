import { DbModelCollection, DbModelType } from "../entities/DbModel";
import { FutureData } from "../entities/FutureData";

export interface DbModelRepository {
    search(options: SearchOptions): FutureData<DbModelCollection>;
}

export interface SearchOptions {
    query: string;
    type?: DbModelType,
}
