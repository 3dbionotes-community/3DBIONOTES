import _ from "lodash";
import { Covid19InfoRepository, GetOptions } from "../repositories/Covid19InfoRepository";
import { FutureData } from "../entities/FutureData";
import { Covid19Info } from "../entities/Covid19Info";

export class GetCovid19InfoUseCase {
    constructor(private covid19InfoRepository: Covid19InfoRepository) {}

    execute(options: GetOptions): FutureData<Covid19Info> {
        return this.covid19InfoRepository.get(options);
    }
}
