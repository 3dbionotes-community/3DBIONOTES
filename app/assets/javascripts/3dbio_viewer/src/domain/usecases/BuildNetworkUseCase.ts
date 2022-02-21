import { FutureData } from "../entities/FutureData";
import {
    BuildNetworkOptions,
    BuildNetworkResult,
    NetworkRepository,
} from "../repositories/NetworkRepository";

export class BuildNetworkUseCase {
    constructor(private networkRepository: NetworkRepository) {}

    execute(options: BuildNetworkOptions): FutureData<BuildNetworkResult> {
        return this.networkRepository.build(options);
    }
}
