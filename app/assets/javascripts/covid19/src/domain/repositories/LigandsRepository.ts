import { FutureData } from "../../data/utils/future";
import { LigandImageData } from "../entities/LigandImageData";

export interface LigandsRepository {
    getImageDataResource: (inChI: string) => FutureData<LigandImageData>;
}
