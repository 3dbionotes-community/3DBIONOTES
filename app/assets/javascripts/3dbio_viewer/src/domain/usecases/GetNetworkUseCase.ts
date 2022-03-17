import { FutureData } from "../entities/FutureData";
import { ProteinNetwork } from "../entities/ProteinNetwork";
import { NetworkRepository } from "../repositories/NetworkRepository";

export class GetProteinNetworkUseCase {
    constructor(private networkRepository: NetworkRepository) {}

    execute(token: string): FutureData<ProteinNetwork> {
        return this.networkRepository.get({ jobId: token });
    }
}
