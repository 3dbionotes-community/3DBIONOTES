import { Covid19InfoFromJsonRepository } from "./data/Covid19InfoFromJsonRepository";
import { BrowserDataGridRepository } from "./data/BrowserDataGridRepository";
import { ExportStructuresUseCase } from "./domain/usecases/ExportStructuresUseCase";
import { GetCovid19InfoUseCase } from "./domain/usecases/GetCovid19InfoUseCase";
import { GetAutoSuggestionsUseCase } from "./domain/usecases/GetAutoSuggestionsUseCase";
import { SearchCovid19InfoUseCase } from "./domain/usecases/SearchCovid19InfoUseCase";
import { AddDynamicInfoToCovid19InfoUseCase } from "./domain/usecases/AddDynamicInfoToCovid19InfoUseCase";
import { LocalStorageCacheRepository } from "./data/LocalStorageCacheRepository";
import { LigandsApiRepository } from "./data/LigandsApiRepository";
import { GetLigandImageDataResourcesUseCase } from "./domain/usecases/GetLigandImageDataResourcesUseCase";

export function getCompositionRoot() {
    const covid19InfoRepository = new Covid19InfoFromJsonRepository();
    const dataGridRepository = new BrowserDataGridRepository();
    const cacheRepository = new LocalStorageCacheRepository();
    const ligandsRepository = new LigandsApiRepository();

    return {
        getCovid19Info: new GetCovid19InfoUseCase(covid19InfoRepository),
        getAutoSuggestions: new GetAutoSuggestionsUseCase(covid19InfoRepository),
        searchCovid19Info: new SearchCovid19InfoUseCase(covid19InfoRepository),
        exportStructures: new ExportStructuresUseCase(dataGridRepository),
        addDynamicInfo: new AddDynamicInfoToCovid19InfoUseCase(
            covid19InfoRepository,
            cacheRepository
        ),
        ligands: {
            getIDR: new GetLigandImageDataResourcesUseCase(ligandsRepository),
        },
    };
}

export type CompositionRoot = ReturnType<typeof getCompositionRoot>;
