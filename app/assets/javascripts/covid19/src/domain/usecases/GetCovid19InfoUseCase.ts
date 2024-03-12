import { Covid19InfoRepository, GetOptions } from "../repositories/Covid19InfoRepository";

export class GetCovid19InfoUseCase {
    constructor(private covid19InfoRepository: Covid19InfoRepository) {}

    execute(options: GetOptions) {
        return this.covid19InfoRepository.get(options);
    }
}
