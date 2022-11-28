import { LigandsRepository } from "../repositories/LigandsRepository";

export class GetLigandImageDataResourcesUseCase {
    constructor(private ligandsRepository: LigandsRepository) {}

    execute(inChI: string) {
        return this.ligandsRepository.getImageDataResource(inChI);
    }
}
