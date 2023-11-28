import { BasicNMRTarget } from "../entities/Protein";
import { NMRRepository, NMRPagination } from "../repositories/NMRRepository";

export class GetPartialNMRTargetUseCase {
    constructor(private nmrRepository: NMRRepository) {}

    execute(target: BasicNMRTarget, pagination: NMRPagination) {
        return this.nmrRepository.getPartialNMRTarget(target, pagination);
    }
}
