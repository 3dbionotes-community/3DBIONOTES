import { FutureData } from "../entities/FutureData";
import { PdbId } from "../entities/Pdb";
import { PdbInfo } from "../entities/PdbInfo";

export interface PdbInfoRepository {
    get(args: GetPdbInfoArgs): FutureData<PdbInfo>;
}

export type GetPdbInfoArgs = {
    pdbId: PdbId;
    onProcessDelay: (reason: string) => void;
};
