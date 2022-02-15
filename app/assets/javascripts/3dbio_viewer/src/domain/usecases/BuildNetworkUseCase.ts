import { FutureData } from "../entities/FutureData";
import {
    BuildResponse,
    NetworkDefinition,
    NetworkRepository,
} from "../repositories/NetworkRepository";

export class BuildNetworkUseCase {
    constructor(private networkRepository: NetworkRepository) {}

    execute(definition: NetworkDefinition): FutureData<BuildResponse> {
        return this.networkRepository.build(definition);
    }
}
