import { Covid19InfoFromJsonRepository } from "./data/repositories/Covid19InfoFromJsonRepository";
import { BrowserDataGridRepository } from "./data/repositories/BrowserDataGridRepository";
import { ExportStructuresUseCase } from "./domain/usecases/ExportStructuresUseCase";
import { GetCovid19InfoUseCase } from "./domain/usecases/GetCovid19InfoUseCase";
import { GetAutoSuggestionsUseCase } from "./domain/usecases/GetAutoSuggestionsUseCase";
import { SearchCovid19InfoUseCase } from "./domain/usecases/SearchCovid19InfoUseCase";
import { AddDynamicInfoToCovid19InfoUseCase } from "./domain/usecases/AddDynamicInfoToCovid19InfoUseCase";
import { LocalStorageCacheRepository } from "./data/repositories/LocalStorageCacheRepository";
import { LigandsApiRepository } from "./data/repositories/LigandsApiRepository";
import { GetLigandImageDataResourcesUseCase } from "./domain/usecases/GetLigandImageDataResourcesUseCase";
import { BionotesOntologyRepository } from "./data/repositories/BioOntologyRepository";
import { BionotesOrganismRepository } from "./data/repositories/BionotesOrganismRepository";
import { EntitiesApiRepository } from "./data/repositories/EntitiesApiRepository";
import { GetNMRTargetUseCase } from "./domain/usecases/GetNMRTargetUseCase";

export function getCompositionRoot() {
    const covid19InfoRepository = new Covid19InfoFromJsonRepository();
    const dataGridRepository = new BrowserDataGridRepository();
    const cacheRepository = new LocalStorageCacheRepository();
    const ligandsRepository = new LigandsApiRepository();
    const ontologyRepository = new BionotesOntologyRepository();
    const organismRepository = new BionotesOrganismRepository();
    const entitiesRepository = new EntitiesApiRepository();

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
            getIDR: new GetLigandImageDataResourcesUseCase(
                ligandsRepository,
                ontologyRepository,
                organismRepository
            ),
        },
        entities: {
            getNMR: new GetNMRTargetUseCase(entitiesRepository),
        },
    };
}

export type CompositionRoot = ReturnType<typeof getCompositionRoot>;
