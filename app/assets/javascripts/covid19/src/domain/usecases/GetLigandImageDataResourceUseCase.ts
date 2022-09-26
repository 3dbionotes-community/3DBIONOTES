import { LigandsRepository } from "../repositories/LigandsRepository";

export class GetLigandImageDataResourceUseCase {
    constructor(private ligandsRepository: LigandsRepository) {}

    execute() {
        return this.ligandsRepository.getImageDataResource();
    }
}
