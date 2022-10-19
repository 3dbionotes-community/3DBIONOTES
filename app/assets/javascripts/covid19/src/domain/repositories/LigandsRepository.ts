import { FutureData } from "../../data/utils/future";
import { LigandImageData } from "../entities/LigandImageData";
import { Maybe } from "../../data/utils/ts-utils";

export interface LigandsRepository {
    getImageDataResource: (inChI: string) => FutureData<Maybe<LigandImageData>>;
}
