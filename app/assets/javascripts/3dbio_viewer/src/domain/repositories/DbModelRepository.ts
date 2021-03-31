import { DbModelCollection, DbModelType } from "../entities/DbModel";
import { FutureData } from "../entities/FutureData";
import { UploadData } from "../entities/UploadData";


export interface DbModelRepository {
    search(options: SearchOptions): FutureData<DbModelCollection>;
    upload(options: UploadOptions): FutureData<UploadData>;
}

export interface SearchOptions {
    query: string;
    type?: DbModelType;
}

export interface UploadOptions {
    structureFile: File;
    jobTitle?: string;
    annotationsFile?: File;
}
