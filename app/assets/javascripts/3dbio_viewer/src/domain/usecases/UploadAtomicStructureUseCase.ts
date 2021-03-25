import { UseCase } from "../../compositionRoot";
import { DbModelRepository, UploadOptions } from "../repositories/DbModelRepository";

export class UploadAtomicStructureUseCase implements UseCase {
    constructor(private dbModelRepository: DbModelRepository) {}

    execute(options: UploadOptions) {
        return this.dbModelRepository.upload(options);
    }
}
