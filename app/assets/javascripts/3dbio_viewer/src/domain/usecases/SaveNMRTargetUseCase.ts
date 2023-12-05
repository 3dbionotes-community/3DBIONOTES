import { BasicNMRFragmentTarget } from "../entities/Protein";
import { NMRRepository } from "../repositories/NMRRepository";

export class SaveNMRTargetUseCase {
    constructor(private nmrRepository: NMRRepository) {}

    execute(target: BasicNMRFragmentTarget) {
        return this.nmrRepository
            .getNMRTarget(target)
            .map(target => this.nmrRepository.saveNMRTarget(target));
    }
}
