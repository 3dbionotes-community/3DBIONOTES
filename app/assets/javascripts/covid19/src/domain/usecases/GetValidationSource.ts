import { SourceName } from "../entities/Covid19Info";
import { Covid19InfoRepository } from "../repositories/Covid19InfoRepository";

export class GetValidationSource {
    constructor(private covid19InfoRepository: Covid19InfoRepository) {}

    execute(source: SourceName) {
        return this.covid19InfoRepository.getValidationSource(source);
    }
}
