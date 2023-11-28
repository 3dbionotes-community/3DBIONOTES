import { NMRRepository, NMRPagination } from "../repositories/NMRRepository";

export class GetPartialNMRTargetUseCase {
    constructor(private nmrRepository: NMRRepository) {}

    execute(uniprotId: string, start: number, end: number, pagination: NMRPagination) {
        return this.nmrRepository.getPartialNMRTarget(uniprotId, start, end, pagination);
    }
}
