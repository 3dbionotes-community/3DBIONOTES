import { DbModelCollection, DbModelType } from "../entities/DbModel";
import { FutureData } from "../entities/FutureData";

export interface DbModelRepository {
    search(options: SearchOptions): FutureData<DbModelCollection>;
    upload(options: UploadOptions): Boolean;
}

export interface SearchOptions {
    query: string;
    type?: DbModelType;
}
export interface UploadOptions {
    jobTitle?: string;
    structureFile: File | undefined;
    annotationsFile?: File | undefined;
}
