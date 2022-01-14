import { PdbOptions, PdbRepository } from "../repositories/PdbRepository";

export class GetPdbUseCase {
    constructor(private pdbRepository: PdbRepository) {}

    execute(options: PdbOptions) {
        return this.pdbRepository.get(options);
    }
}
