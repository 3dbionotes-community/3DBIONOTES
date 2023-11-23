import { EntitiesRepository, NMRPagination } from "../repositories/EntitiesRepository";

export class GetPartialNMRTargetUseCase {
    constructor(private entitiesRepository: EntitiesRepository) {}

    execute(uniprotId: string, start: number, end: number, pagination: NMRPagination) {
        return this.entitiesRepository.getPartialNMRTarget(uniprotId, start, end, pagination);
    }
}
