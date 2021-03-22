import { UseCase } from "../../compositionRoot";
import { EbiDbModelRepository } from "../../data/repositories/EbiDbModelRepository";
import { UploadOptions } from "../repositories/DbModelRepository";

export class UploadAtomicStructureUseCase implements UseCase {
    constructor(private dbModelRepository: EbiDbModelRepository) {}

    execute(options: UploadOptions) {
        return this.dbModelRepository.upload(options);
    }
}
