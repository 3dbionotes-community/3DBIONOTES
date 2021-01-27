import { UseCase } from "../../compositionRoot";
import { PdbOptions, PdbRepository } from "../repositories/PdbRepository";

export class GetPdbUseCase implements UseCase {
    constructor(private pdbRepository: PdbRepository) {}

    execute(options: PdbOptions) {
        return this.pdbRepository.get(options);
    }
}
