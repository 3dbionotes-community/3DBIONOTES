import { AtomicStructure, AtomicStructureMapping } from "../entities/AtomicStructure";
import { FutureData } from "../entities/FutureData";

export interface AtomicStructureRepository {
    get(options: BuildOptions): FutureData<AtomicStructure>;
    uploadMapping(
        mapping: AtomicStructureMapping,
        fileName: string,
        title: string
    ): FutureData<void>;
}

export interface BuildOptions {
    structureFile: File;
    jobTitle?: string;
    annotationsFile?: File;
}
