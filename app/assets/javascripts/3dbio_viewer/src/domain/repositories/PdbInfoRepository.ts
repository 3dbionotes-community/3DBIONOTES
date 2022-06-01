import { FutureData } from "../entities/FutureData";
import { PdbId } from "../entities/Pdb";
import { PdbInfo } from "../entities/PdbInfo";

export interface PdbInfoRepository {
    get(pdbId: PdbId): FutureData<PdbInfo>;
}
