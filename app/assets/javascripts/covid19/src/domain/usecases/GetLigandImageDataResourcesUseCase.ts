import { Future } from "../../data/utils/future";
import { LigandsRepository } from "../repositories/LigandsRepository";

export class GetLigandImageDataResourcesUseCase {
    constructor(private ligandsRepository: LigandsRepository) {}

    execute(inChIs: string[]) {
        return Future.parallel(
            inChIs.map(inChI =>
                this.ligandsRepository.getImageDataResource(inChI).map(idr => ({ inChI, idr }))
            )
        );
    }
}
