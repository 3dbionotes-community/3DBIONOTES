import { AtomicStructure } from "./AtomicStructure";
import { FutureData } from "./FutureData";

export interface AtomicStructureRepository {
    build(options: BuildOptions): FutureData<AtomicStructure>;
}

export interface BuildOptions {
    structureFile: File;
    jobTitle?: string;
    annotationsFile?: File;
}
