import { Covid19InfoFromJsonRepository } from "./data/Covid19InfoFromJsonRepository";
import { BrowserDataGridRepository } from "./data/BrowserDataGridRepository";
import { ExportStructuresUseCase } from "./domain/usecases/ExportStructuresUseCase";
import { GetCovid19InfoUseCase } from "./domain/usecases/GetCovid19InfoUseCase";
import { AutoCompleteUseCase } from "./domain/usecases/AutoCompleteUseCase";

export function getCompositionRoot() {
    const covid19InfoRepository = new Covid19InfoFromJsonRepository();
    const dataGridRepository = new BrowserDataGridRepository();

    return {
        getCovid19Info: new GetCovid19InfoUseCase(covid19InfoRepository),
        autoSuggestion: new AutoCompleteUseCase(covid19InfoRepository),
        exportStructures: new ExportStructuresUseCase(dataGridRepository),
    };
}

export type CompositionRoot = ReturnType<typeof getCompositionRoot>;
