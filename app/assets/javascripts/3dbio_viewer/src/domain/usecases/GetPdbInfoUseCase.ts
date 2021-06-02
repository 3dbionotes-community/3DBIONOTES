import { FutureData } from "../entities/FutureData";
import { PdbId } from "../entities/Pdb";
import { PdbInfo } from "../entities/PdbInfo";
import { PdbInfoRepository } from "../repositories/PdbInfoRepository";

export class GetPdbInfoUseCase {
    constructor(private pdbInfoRepository: PdbInfoRepository) {}

    execute(pdbId: PdbId): FutureData<PdbInfo> {
        return this.pdbInfoRepository.get(pdbId);
    }
}
