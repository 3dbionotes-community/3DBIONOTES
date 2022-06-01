import { Covid19InfoRepository } from "../repositories/Covid19InfoRepository";

export class GetCovid19InfoUseCase {
    constructor(private covid19InfoRepository: Covid19InfoRepository) {}

    execute() {
        return this.covid19InfoRepository.get();
    }
}
