import { FutureData } from "../entities/FutureData";
import { Source } from "../entities/Source";
import { SourcesRepository } from "../repositories/SourcesRepository";

export class GetSourcesUseCase {
    constructor(private sourcesRepository: SourcesRepository) {}

    execute(): FutureData<Source[]> {
        return this.sourcesRepository.get();
    }
}
