import { BrowserDataGridRepository } from "./data/repositories/BrowserDataGridRepository";
import { ExportStructuresUseCase } from "./domain/usecases/ExportStructuresUseCase";
import { GetCovid19InfoUseCase } from "./domain/usecases/GetCovid19InfoUseCase";
import { GetAutoSuggestionsUseCase } from "./domain/usecases/GetAutoSuggestionsUseCase";
import { LigandsApiRepository } from "./data/repositories/LigandsApiRepository";
import { GetLigandImageDataResourcesUseCase } from "./domain/usecases/GetLigandImageDataResourcesUseCase";
import { BionotesOntologyRepository } from "./data/repositories/BioOntologyRepository";
import { BionotesOrganismRepository } from "./data/repositories/BionotesOrganismRepository";
import { Covid19InfoApiRepository } from "./data/repositories/Covid19InfoApiRepository";
import { EntitiesApiRepository } from "./data/repositories/EntitiesApiRepository";
import { GetPartialNMRTargetUseCase } from "./domain/usecases/GetPartialNMRTargetUseCase";
import { SaveNMRTargetUseCase } from "./domain/usecases/SaveNMRTargetUseCase";
import { GetSourcesUseCase } from "./domain/usecases/GetSourcesUseCase";
import { SourcesApiRepository } from "./data/repositories/SourcesApiRepository";

export function getCompositionRoot() {
    const sourcesRepository = new SourcesApiRepository();
    const covid19InfoApiRepository = new Covid19InfoApiRepository();
    const dataGridRepository = new BrowserDataGridRepository();
    const ligandsRepository = new LigandsApiRepository();
    const ontologyRepository = new BionotesOntologyRepository();
    const organismRepository = new BionotesOrganismRepository();
    const entitiesRepository = new EntitiesApiRepository();

    return {
        getSources: new GetSourcesUseCase(sourcesRepository),
        getCovid19Info: new GetCovid19InfoUseCase(covid19InfoApiRepository),
        getAutoSuggestions: new GetAutoSuggestionsUseCase(covid19InfoApiRepository),
        exportStructures: new ExportStructuresUseCase(dataGridRepository),
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
