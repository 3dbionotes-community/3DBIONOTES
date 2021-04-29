import { AtomicStructure } from "../entities/AtomicStructure";
import { FutureData } from "../entities/FutureData";

export interface AtomicStructureRepository {
    build(options: BuildOptions): FutureData<AtomicStructure>;
}

export interface BuildOptions {
    structureFile: File;
    jobTitle?: string;
    annotationsFile?: File;
}
