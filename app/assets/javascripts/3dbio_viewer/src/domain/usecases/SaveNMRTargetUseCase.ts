import { NMRRepository } from "../repositories/NMRRepository";

export class SaveNMRTargetUseCase {
    constructor(private nmrRepository: NMRRepository) {}

    execute(uniprotId: string, start: number, end: number) {
        return this.nmrRepository
            .getNMRTarget(uniprotId, start, end)
            .map(target => this.nmrRepository.saveNMRTarget(target));
    }
}
