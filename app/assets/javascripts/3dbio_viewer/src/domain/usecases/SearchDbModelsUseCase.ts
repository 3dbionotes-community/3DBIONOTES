import { UseCase } from "../../compositionRoot";
import { DbModelRepository, SearchOptions } from "../repositories/DbModelRepository";

export class SearchDbModelsUseCase implements UseCase {
    constructor(private dbModelRepository: DbModelRepository) {}

    execute(options: SearchOptions) {
        return this.dbModelRepository.search(options);
    }
}
