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
import { GetPartialNMRTargetUseCase } from "./domain/usecases/GetPartialNMRTargetUseCase";
import { SaveNMRTargetUseCase } from "./domain/usecases/SaveNMRTargetUseCase";
import { GetSourcesUseCase } from "./domain/usecases/GetSourcesUseCase";
import { ApiSourcesRepository } from "./data/repositories/ApiSourcesRepository";

export function getCompositionRoot() {
    const sourcesRepository = new ApiSourcesRepository();
    const covid19InfoRepository = new Covid19InfoFromJsonRepository();
    const dataGridRepository = new BrowserDataGridRepository();
    const cacheRepository = new LocalStorageCacheRepository();
    const ligandsRepository = new LigandsApiRepository();
    const ontologyRepository = new BionotesOntologyRepository();
    const organismRepository = new BionotesOrganismRepository();
    const entitiesRepository = new EntitiesApiRepository();

    return {
        getSources: new GetSourcesUseCase(sourcesRepository),
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
            getPartialNMR: new GetPartialNMRTargetUseCase(entitiesRepository),
            saveNMR: new SaveNMRTargetUseCase(entitiesRepository),
        },
    };
}

export type CompositionRoot = ReturnType<typeof getCompositionRoot>;
