import { AtomicStructure } from "../entities/AtomicStructure";
import { AtomicStructureRepository, BuildOptions } from "../repositories/AtomicStructureRepository";
import { FutureData } from "../entities/FutureData";

export class UploadAtomicStructureUseCase {
    constructor(private atomicStructureRepository: AtomicStructureRepository) {}

    execute(options: BuildOptions): FutureData<AtomicStructure> {
        return this.atomicStructureRepository.get(options);
    }
}
