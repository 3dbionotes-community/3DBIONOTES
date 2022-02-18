import { Covid19InfoFromJsonRepository } from "./data/Covid19InfoFromJsonRepository";
import { BrowserDataGridRepository } from "./data/BrowserDataGridRepository";
import { ExportStructuresUseCase } from "./domain/usecases/ExportStructuresUseCase";
import { GetCovid19InfoUseCase } from "./domain/usecases/GetCovid19InfoUseCase";
import { AutoCompleteUseCase } from "./domain/usecases/AutoCompleteUseCase";
import { SearchCovid19InfoUseCase } from "./domain/usecases/SearchCovid19InfoUseCase";
import { AddDynamicInfoToCovid19InfoUseCase } from "./domain/usecases/AddDynamicInfoToCovid19InfoUseCase";
import { LocalStorageCacheRepository } from "./data/LocalStorageCacheRepository";

export function getCompositionRoot() {
    const covid19InfoRepository = new Covid19InfoFromJsonRepository();
    const dataGridRepository = new BrowserDataGridRepository();
    const cacheRepository = new LocalStorageCacheRepository();

    return {
        getCovid19Info: new GetCovid19InfoUseCase(covid19InfoRepository),
        autoSuggestion: new AutoCompleteUseCase(covid19InfoRepository),
        searchCovid19Info: new SearchCovid19InfoUseCase(covid19InfoRepository),
        exportStructures: new ExportStructuresUseCase(dataGridRepository),
        addDynamicInfo: new AddDynamicInfoToCovid19InfoUseCase(
            covid19InfoRepository,
            cacheRepository
        ),
    };
}

export type CompositionRoot = ReturnType<typeof getCompositionRoot>;
