import { UseCase } from "../../compositionRoot";
import { AtomicStructure } from "../entities/AtomicStructure";
import { AtomicStructureRepository, BuildOptions } from "../entities/AtomicStructureRepository";
import { FutureData } from "../entities/FutureData";

export class UploadAtomicStructureUseCase implements UseCase {
    constructor(private atomicStructureRepository: AtomicStructureRepository) {}

    execute(options: BuildOptions): FutureData<AtomicStructure> {
        return this.atomicStructureRepository.build(options);
    }
}
