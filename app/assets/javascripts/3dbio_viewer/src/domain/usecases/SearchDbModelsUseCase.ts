import { UseCase } from "../../compositionRoot";
import { DbModelRepository } from "../repositories/DbModelRepository";
import { SearchOptions } from "../repositories/DbModelRepository";

export class SearchDbModelsUseCase implements UseCase {
    constructor(private dbModelRepository: DbModelRepository) {}

    execute(options: SearchOptions) {
        return this.dbModelRepository.search(options);
    }
}
