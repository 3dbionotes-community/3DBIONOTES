import _ from "lodash";
import { Maybe } from "../../utils/ts-utils";
import { FutureData } from "../entities/FutureData";
import { EmdbId, PdbId } from "../entities/Pdb";
import { DbModelRepository } from "../repositories/DbModelRepository";

export class GetRelatedModelsUseCase {
    constructor(private dbModelRepository: DbModelRepository) {}

    emdbFromPdb(pdbId: PdbId): FutureData<Maybe<EmdbId>> {
        return this.dbModelRepository.getEmdbsFromPdb(pdbId).map(_.first);
    }

    pdbFromEmdb(emdbId: EmdbId): FutureData<Maybe<PdbId>> {
        return this.dbModelRepository.getPdbsFromEmdb(emdbId).map(_.first);
    }
}
