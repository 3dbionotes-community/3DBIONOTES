import { UseCase } from "../../compositionRoot";
import { AtomicStructure } from "../entities/AtomicStructure";
import { FutureData } from "../entities/FutureData";
import { DbModelRepository, UploadOptions } from "../repositories/DbModelRepository";

export class UploadAtomicStructureUseCase implements UseCase {
    constructor(private dbModelRepository: DbModelRepository) {}

    execute(options: UploadOptions): FutureData<AtomicStructure> {
        return this.dbModelRepository.upload(options);
    }
}
