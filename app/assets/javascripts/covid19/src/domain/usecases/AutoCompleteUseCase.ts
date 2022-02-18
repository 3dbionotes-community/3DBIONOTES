import { Covid19InfoRepository, SearchOptions } from "../repositories/Covid19InfoRepository";

export class AutoCompleteUseCase {
    constructor(private covid19InfoRepository: Covid19InfoRepository) {}

    execute(search: string) {
        return this.covid19InfoRepository.autoSuggestion(search);
    }
}
