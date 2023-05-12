import { Maybe } from "../../data/utils/ts-utils";
import { FutureData } from "../entities/FutureData";
import { LigandImageData } from "../entities/LigandImageData";
import { IDROptions } from "../usecases/GetLigandImageDataResourcesUseCase";

export interface LigandsRepository {
    getImageDataResource: (
        inChI: string,
        pdbId: string,
        idrOptions: IDROptions
    ) => FutureData<Maybe<LigandImageData>>;
}
