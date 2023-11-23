import { EntitiesRepository } from "../repositories/EntitiesRepository";

export class SaveNMRTargetUseCase {
    constructor(private entitiesRepository: EntitiesRepository) {}

    execute(uniprotId: string, start: number, end: number) {
        return this.entitiesRepository
            .getNMRTarget(uniprotId, start, end)
            .map(target => this.entitiesRepository.saveNMRTarget(target));
    }
}
