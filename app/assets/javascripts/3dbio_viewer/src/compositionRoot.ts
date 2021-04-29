import { BionotesAtomicStructureRepository } from "./data/repositories/BionotesAtomicStructureRepository";
import { BionotesDbModelRepository } from "./data/repositories/BionotesDbModelRepository";
import { EbiDbModelRepository } from "./data/repositories/EbiDbModelRepository";
import { ApiPdbRepository } from "./data/repositories/protvista/ApiPdbRepository";
import { GetPdbUseCase } from "./domain/usecases/GetPdbUseCase";
import { GetRelatedModelsUseCase } from "./domain/usecases/GetRelatedModelsUseCase";
import { SearchDbModelsUseCase } from "./domain/usecases/SearchDbModelsUseCase";
import { UploadAtomicStructureUseCase } from "./domain/usecases/UploadAtomicStructureUseCase";

export function getCompositionRoot() {
    const pdbRepository = new ApiPdbRepository();
    const dbModelRepository = new EbiDbModelRepository();
    const dbModelRepositoryForRelatedModels = new BionotesDbModelRepository();
    const atomicStructureRepository = new BionotesAtomicStructureRepository();

    return {
        getPdb: new GetPdbUseCase(pdbRepository),
        searchDbModels: new SearchDbModelsUseCase(dbModelRepository),
        uploadAtomicStructure: new UploadAtomicStructureUseCase(atomicStructureRepository),
        getRelatedModels: new GetRelatedModelsUseCase(
            dbModelRepositoryForRelatedModels
        ),
    };
}

export type CompositionRoot = ReturnType<typeof getCompositionRoot>;
