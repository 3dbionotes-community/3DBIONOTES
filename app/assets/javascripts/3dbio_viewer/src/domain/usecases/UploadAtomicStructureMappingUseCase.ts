import { AtomicStructure, AtomicStructureMapping, ChainObject } from "../entities/AtomicStructure";
import { AtomicStructureRepository } from "../repositories/AtomicStructureRepository";
import { FutureData } from "../entities/FutureData";
import { AllowedExtension } from "../../webapp/view-models/Selection";

export class UploadAtomicStructureMappingUseCase {
    constructor(private atomicStructureRepository: AtomicStructureRepository) {}

    execute(
        structure: AtomicStructure,
        chainObjects: ChainObject[],
        fileExtension: AllowedExtension,
        title: string
    ): FutureData<{ token: string }> {
        const mapping: AtomicStructureMapping = {
            token: structure.token,
            mapping: structure.mapping,
            chainObjects,
        };

        return this.atomicStructureRepository
            .uploadMapping(
                mapping,
                "structure_file." + fileExtension === "ent" ? "pdb" : fileExtension,
                title
            )
            .map(() => ({ token: structure.token }));
    }
}
