import { EntitiesRepository } from "../repositories/EntitiesRepository";

export class GetNMRTargetUseCase {
    constructor(private entitiesRepository: EntitiesRepository) {}

    execute(uniprotId: string, start: number, end: number) {
        return this.entitiesRepository.getNMRTarget(uniprotId, start, end);
    }
}
