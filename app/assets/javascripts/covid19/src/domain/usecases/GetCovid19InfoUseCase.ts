import { Covid19InfoRepository, SearchOptions } from "../repositories/Covid19InfoRepository";

export class GetCovid19InfoUseCase {
    constructor(private covid19InfoRepository: Covid19InfoRepository) {}

    execute(options: SearchOptions) {
        return this.covid19InfoRepository.search(options);
    }
}
