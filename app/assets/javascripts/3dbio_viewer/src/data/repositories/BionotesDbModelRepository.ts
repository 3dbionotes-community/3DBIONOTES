import _ from "lodash";
import { DbModelCollection } from "../../domain/entities/DbModel";
import { FutureData } from "../../domain/entities/FutureData";
import { EmdbId, PdbId } from "../../domain/entities/Pdb";
import { DbModelRepository, SearchOptions } from "../../domain/repositories/DbModelRepository";
import { routes } from "../../routes";
import { getFromUrl } from "../request-utils";
import { EmdbPdbMapping, getEmdbsFromMapping, getPdbsFromMapping, PdbEmdbMapping } from "./mapping";

export class BionotesDbModelRepository implements DbModelRepository {
    search(_options: SearchOptions): FutureData<DbModelCollection> {
        throw new Error("Not implemented");
    }

    getEmdbsFromPdb(pdbId: PdbId): FutureData<EmdbId[]> {
        return getFromUrl<PdbEmdbMapping>(
            `${routes.bionotes}/api/mappings/PDB/EMDB/${pdbId}`
        ).map(mapping => getEmdbsFromMapping(mapping, pdbId));
    }

    getPdbsFromEmdb(emdbId: EmdbId): FutureData<PdbId[]> {
        return getFromUrl<EmdbPdbMapping>(
            `${routes.bionotes}/api/mappings/EMDB/PDB/${emdbId}`
        ).map(mapping => getPdbsFromMapping(mapping, emdbId));
    }
}
