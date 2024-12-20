import { BasicNSPTarget } from "../entities/Covid19Info";
import { EntitiesRepository, NMRPagination } from "../repositories/EntitiesRepository";

export class GetPartialNMRTargetUseCase {
    constructor(private entitiesRepository: EntitiesRepository) {}

    execute(target: BasicNSPTarget, pagination: NMRPagination) {
        return this.entitiesRepository.getPartialNMRTarget(target, pagination);
    }
}
