import { FutureData } from "../entities/FutureData";
import { DbModelRepository, SearchOptions } from "../repositories/DbModelRepository";
import { SearchResults } from "../entities/SearchResults";

export class SearchDbModelsUseCase {
    constructor(private dbModelRepository: DbModelRepository) {}

    execute(options: SearchOptions): FutureData<SearchResults> {
        return this.dbModelRepository.search(options);
    }
}
