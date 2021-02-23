import { AxiosRequestConfig } from "axios";
import _ from "lodash";
import { DbModel, DbModelCollection } from "../../domain/entities/DbModel";
import { FutureData } from "../../domain/entities/FutureData";
import { DbModelRepository, SearchOptions } from "../../domain/repositories/DbModelRepository";
import { Future } from "../../utils/future";
import { axiosRequest, defaultBuilder, DefaultError } from "../../utils/future-axios";

const config = {
    pdb: {
        type: "pdb" as const,
        searchUrl: "https://www.ebi.ac.uk/ebisearch/ws/rest/pdbe",
        imageUrl: (id: string) =>
            `https://www.ebi.ac.uk/pdbe/static/entry/${id}_deposited_chain_front_image-200x200.png`,
    },
    emdb: {
        type: "emdb" as const,
        searchUrl: "https://www.ebi.ac.uk/ebisearch/ws/rest/emdb",
        imageUrl: (id: string) => {
            const id2 = id.split("-")[1] || "";
            return `https://www.ebi.ac.uk/pdbe/static/entry/${id}/400_${id2}.gif`;
        },
    },
};

interface ItemConfig {
    type: DbModel["type"];
    searchUrl: string;
    imageUrl(id: string): string;
}

export class EbiDbModelRepository implements DbModelRepository {
    search(options: SearchOptions): FutureData<DbModelCollection> {
        const searchAllTypes = !options.type;
        const searchPdb = searchAllTypes || options.type === "pdb";
        const searchEmdb = searchAllTypes || options.type === "emdb";

        const pdbModels: FutureData<DbModelCollection> = searchPdb
            ? getPdbModels(config.pdb, options.query)
            : Future.success([]);

        const emdbModels: FutureData<DbModelCollection> = searchEmdb
            ? getPdbModels(config.emdb, options.query)
            : Future.success([]);

        return Future.join2(pdbModels, emdbModels).map(_.flatten);
    }
}

interface ApiSearchParams {
    format: "JSON";
    size?: number;
    requestFrom?: "queryBuilder";
    fieldurl?: boolean;
    viewurl?: boolean;
    fields?: string;
    query?: string;
    entryattrs?: "score";
}

interface ApiSearchResponse {
    hitCount: number;
    entries: ApiEntryResponse[];
    facets: unknown[];
}

interface ApiEntryResponse {
    acc: string;
    id: string;
    source: "pdbe";
    score: number;
    fields: Array<{
        name: string[];
        description: string[];
    }>;
    fieldURLs: Array<{
        name: string;
        value: string;
    }>;
    viewURLs: Array<{
        name: string;
        value: string;
    }>;
}

function request<Data>(url: string, params: ApiSearchParams): Future<DefaultError, Data> {
    const request: AxiosRequestConfig = { url, params };
    return axiosRequest<DefaultError, Data>(defaultBuilder, request);
}

function getPdbModels(config: ItemConfig, query: string): FutureData<DbModel[]> {
    if (!query.trim()) return Future.success([]);

    const pdbResults = request<ApiSearchResponse>(config.searchUrl, {
        format: "JSON",
        size: 10,
        fields: "name,description",
        query: query,
        entryattrs: "score",
    });

    return pdbResults.map((res): DbModel[] => {
        return res.entries.map(entry => ({
            type: config.type,
            id: entry.id,
            imageUrl: config.imageUrl(entry.id),
        }));
    });
}
