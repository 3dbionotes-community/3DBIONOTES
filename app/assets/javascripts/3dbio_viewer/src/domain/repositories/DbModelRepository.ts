import { DbModelCollection, DbModelType } from "../entities/DbModel";
import { FutureData } from "../entities/FutureData";
import { AtomicStructure } from "../entities/AtomicStructure";

export interface DbModelRepository {
    search(options: SearchOptions): FutureData<DbModelCollection>;
    upload(options: UploadOptions): FutureData<AtomicStructure>;
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
