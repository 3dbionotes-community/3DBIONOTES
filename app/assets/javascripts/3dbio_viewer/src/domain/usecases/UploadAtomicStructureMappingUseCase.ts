import { AtomicStructure, AtomicStructureMapping, ChainObject } from "../entities/AtomicStructure";
import { AtomicStructureRepository } from "../repositories/AtomicStructureRepository";
import { FutureData } from "../entities/FutureData";

export class UploadAtomicStructureMappingUseCase {
    constructor(private atomicStructureRepository: AtomicStructureRepository) {}

    execute(
        structure: AtomicStructure,
        chainObjects: ChainObject[]
    ): FutureData<{ token: string }> {
        const mapping: AtomicStructureMapping = {
            token: structure.token,
            mapping: structure.mapping,
            chainObjects,
        };

        return this.atomicStructureRepository
            .uploadMapping(mapping)
            .map(() => ({ token: structure.token }));
    }
}
