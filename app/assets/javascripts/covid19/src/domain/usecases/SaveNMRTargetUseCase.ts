import { BasicNSPTarget } from "../entities/Covid19Info";
import { EntitiesRepository } from "../repositories/EntitiesRepository";

export class SaveNMRTargetUseCase {
    constructor(private entitiesRepository: EntitiesRepository) {}

    execute(target: BasicNSPTarget) {
        return this.entitiesRepository
            .getNMRTarget(target)
            .map(target => this.entitiesRepository.saveNMRTarget(target));
    }
}
