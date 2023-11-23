import { EntitiesRepository, NMRPagination } from "../repositories/EntitiesRepository";

export class GetNMRTargetUseCase {
    constructor(private entitiesRepository: EntitiesRepository) {}

    execute(uniprotId: string, start: number, end: number, pagination: NMRPagination) {
        return this.entitiesRepository.getNMRTarget(uniprotId, start, end, pagination);
    }
}
