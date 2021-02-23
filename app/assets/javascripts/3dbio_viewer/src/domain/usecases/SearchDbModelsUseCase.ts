import { UseCase } from "../../compositionRoot";
import { EbiDbModelRepository } from "../../data/repositories/EbiDbModelRepository";
import { SearchOptions } from "../repositories/DbModelRepository";

export class SearchDbModelsUseCase implements UseCase {
    constructor(private dbModelRepository: EbiDbModelRepository) {}

    execute(options: SearchOptions) {
        return this.dbModelRepository.search(options);
    }
}
