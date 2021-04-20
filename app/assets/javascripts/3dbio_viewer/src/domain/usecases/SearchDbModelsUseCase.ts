import { UseCase } from "../../compositionRoot";
import { DbModelCollection } from "../entities/DbModel";
import { FutureData } from "../entities/FutureData";
import { DbModelRepository, SearchOptions } from "../repositories/DbModelRepository";

export class SearchDbModelsUseCase implements UseCase {
    constructor(private dbModelRepository: DbModelRepository) {}

    execute(options: SearchOptions): FutureData<DbModelCollection> {
        return this.dbModelRepository.search(options);
    }
}
