import { FutureData } from "../entities/FutureData";
import { PdbInfo } from "../entities/PdbInfo";
import { GetPdbInfoArgs, PdbInfoRepository } from "../repositories/PdbInfoRepository";

export class GetPdbInfoUseCase {
    constructor(private pdbInfoRepository: PdbInfoRepository) {}

    execute(args: GetPdbInfoArgs): FutureData<PdbInfo> {
        return this.pdbInfoRepository.get(args);
    }
}
