import { Covid19InfoRepository } from "../repositories/Covid19InfoRepository";

export class GetAutoSuggestionsUseCase {
    constructor(private covid19InfoRepository: Covid19InfoRepository) {}

    execute(search: string) {
        return this.covid19InfoRepository.autoSuggestions(search);
    }
}
