import { Covid19InfoFromJsonRepository } from "./data/Covid19InfoFromJsonRepository";
import { GetCovid19InfoUseCase } from "./domain/usecases/GetCovid19InfoUseCase";

export function getCompositionRoot() {
    const covid19InfoRepository = new Covid19InfoFromJsonRepository();

    return {
        getCovid19Info: new GetCovid19InfoUseCase(covid19InfoRepository),
    };
}

export type CompositionRoot = ReturnType<typeof getCompositionRoot>;
