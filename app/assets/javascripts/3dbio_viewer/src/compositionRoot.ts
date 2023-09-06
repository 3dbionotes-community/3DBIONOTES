import { BionotesAtomicStructureRepository } from "./data/repositories/BionotesAtomicStructureRepository";
import { BionotesDbModelRepository } from "./data/repositories/BionotesDbModelRepository";
import { BionotesPdbInfoRepository } from "./data/repositories/BionotesPdbInfoRepository";
import { EbiDbModelRepository } from "./data/repositories/EbiDbModelRepository";
import { ApiPdbRepository } from "./data/repositories/protvista/ApiPdbRepository";
import { UploadDataBionotesRepository } from "./data/repositories/UploadDataBionotesRepository";
import { GetPdbInfoUseCase } from "./domain/usecases/GetPdbInfoUseCase";
import { GetPdbUseCase } from "./domain/usecases/GetPdbUseCase";
import { GetUploadDataUseCase } from "./domain/usecases/GetUploadDataUseCase";
import { GetRelatedModelsUseCase } from "./domain/usecases/GetRelatedModelsUseCase";
import { SearchDbModelsUseCase } from "./domain/usecases/SearchDbModelsUseCase";
import { UploadAtomicStructureUseCase } from "./domain/usecases/UploadAtomicStructureUseCase";
import { UploadAtomicStructureMappingUseCase } from "./domain/usecases/UploadAtomicStructureMappingUseCase";
import { GetAnnotationsFromUploadData } from "./domain/usecases/GetAnnotationsFromUploadData";
import { DownloadAnnotationsExampleUseCase } from "./domain/usecases/DownloadAnnotationsExampleUseCase";
import { BuildNetworkUseCase } from "./domain/usecases/BuildNetworkUseCase";
import { BionotesNetworkRepository } from "./data/repositories/BionotesNetworkRepository";
import { GetProteinNetworkUseCase as GetNetworkUseCase } from "./domain/usecases/GetNetworkUseCase";
import { BionotesOntologyRepository } from "./data/repositories/BionotesOntologyRepository";
import { BionotesOrganismRepository } from "./data/repositories/BionotesOrganismRepository";
import { ExportAllAnnotationsUseCase } from "./domain/usecases/ExportAllAnnotationsUseCase";
import { ExportDataBionotesRepository } from "./data/repositories/ExportDataBionotesRepository";
import { ExportAnnotationsUseCase } from "./domain/usecases/ExportAnnotationsUseCase";

export function getCompositionRoot() {
    const pdbRepository = new ApiPdbRepository();
    const dbModelRepository = new EbiDbModelRepository();
    const dbModelRepositoryForRelatedModels = new BionotesDbModelRepository();
    const atomicStructureRepository = new BionotesAtomicStructureRepository();
    const pdbInfoRepository = new BionotesPdbInfoRepository();
    const uploadDataRepository = new UploadDataBionotesRepository();
    const networkRepository = new BionotesNetworkRepository();
    const ontologyRepository = new BionotesOntologyRepository();
    const organismRepository = new BionotesOrganismRepository();
    const exportDataRepository = new ExportDataBionotesRepository();

    return {
        getPdb: new GetPdbUseCase(pdbRepository, ontologyRepository, organismRepository),
        getPdbInfo: new GetPdbInfoUseCase(pdbInfoRepository),
        searchDbModels: new SearchDbModelsUseCase(dbModelRepository),
        uploadAtomicStructure: new UploadAtomicStructureUseCase(atomicStructureRepository),
        uploadAtomicStructureMapping: new UploadAtomicStructureMappingUseCase(
            atomicStructureRepository
        ),
        getRelatedModels: new GetRelatedModelsUseCase(dbModelRepositoryForRelatedModels),
        getAnnotations: new GetAnnotationsFromUploadData(uploadDataRepository),
        getUploadData: new GetUploadDataUseCase(uploadDataRepository),
        downloadAnnotationsExample: new DownloadAnnotationsExampleUseCase(uploadDataRepository),
        exportAllAnnotations: new ExportAllAnnotationsUseCase(exportDataRepository),
        exportAnnotations: new ExportAnnotationsUseCase(exportDataRepository),
        buildNetwork: new BuildNetworkUseCase(networkRepository),
        getNetwork: new GetNetworkUseCase(networkRepository),
    };
}

export type CompositionRoot = ReturnType<typeof getCompositionRoot>;
