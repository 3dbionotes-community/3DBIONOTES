import _ from "lodash";
import { FutureData } from "../../domain/entities/FutureData";
import { EmdbId, PdbId } from "../../domain/entities/Pdb";
import { SearchResults } from "../../domain/entities/SearchResults";
import { DbModelRepository, SearchOptions } from "../../domain/repositories/DbModelRepository";
import { routes } from "../../routes";
import { getFromUrl } from "../request-utils";
import { EmdbPdbMapping, getEmdbsFromMapping, getPdbsFromMapping, PdbEmdbMapping } from "./mapping";

export class BionotesDbModelRepository implements DbModelRepository {
    search(_options: SearchOptions): FutureData<SearchResults> {
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
