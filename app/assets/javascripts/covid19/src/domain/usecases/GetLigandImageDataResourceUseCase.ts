import { LigandsRepository } from "../repositories/LigandsRepository";

export class GetLigandImageDataResourceUseCase {
    constructor(private ligandsRepository: LigandsRepository) {}

    execute(id: string) {
        return this.ligandsRepository.getImageDataResource(id);
    }
}
