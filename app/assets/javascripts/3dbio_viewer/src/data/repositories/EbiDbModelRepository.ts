import _ from "lodash";
import { DbModel, DbModelCollection } from "../../domain/entities/DbModel";
import { FutureData } from "../../domain/entities/FutureData";
import { DbModelRepository, SearchOptions } from "../../domain/repositories/DbModelRepository";
import { Future } from "../../utils/future";
import { assert } from "../../utils/ts-utils";
import { request } from "../request-utils";

const searchPageSize = 30;

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
//http://rinchen-dos.cnb.csic.es:8882
//http://3dbionotes.cnb.csic.es
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
        const pdbModels = getPdbModels(searchPdb, config.pdb, options.query);
        const emdbModels = getPdbModels(searchEmdb, config.emdb, options.query);

        return Future.join2(emdbModels, pdbModels).map(collections =>
            _(collections)
                .flatten()
                .sortBy(model => -model.score)
                .take(searchPageSize)
                .value()
        );
    }

}

const apiFields = ["name", "author", "method", "resolution", "specimenstate"] as const;

type ApiField = typeof apiFields[number];

interface ApiSearchParams {
    format: "JSON";
    size?: number;
    requestFrom?: "queryBuilder";
    fieldurl?: boolean;
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
    fields: Record<ApiField, string[] | undefined>;
    fieldURLs: Array<{ name: string; value: string }>;
}

function getStringDate(options: { yearsOffset?: number } = {}): string {
    const { yearsOffset = 0 } = options;
    const date = new Date();
    date.setFullYear(date.getFullYear() - yearsOffset);
    const stringDate = date.toISOString().split("T")[0];
    return assert(stringDate);
}

const startDate = getStringDate({ yearsOffset: -1 });
const endDate = getStringDate();

const emptySearchesByType: Record<DbModel["type"], string> = {
    pdb: `last_modification_date:[${startDate} TO ${endDate}]`,
    emdb: `headerReleaseDate_date:[${startDate} TO ${endDate}]`,
};

function getPdbModels(
    performSearch: boolean,
    config: ItemConfig,
    query: string
): FutureData<DbModel[]> {
    if (!performSearch) return Future.success([]);

    const searchQuery = query.trim() ? query : emptySearchesByType[config.type];
    const params: ApiSearchParams = {
        format: "JSON",
        // Get more records so we can do a more meaningful sorting by score on the grouped collection
        size: searchPageSize * 10,
        fields: apiFields.join(","),
        query: searchQuery,
        entryattrs: "score",
        fieldurl: true,
    };

    const pdbResults = request<ApiSearchResponse>({ url: config.searchUrl, params });

    return pdbResults.map((res): DbModel[] => {
        return res.entries.map(entry => ({
            type: config.type,
            id: entry.id,
            score: entry.score,
            url: getUrl(entry),
            imageUrl: config.imageUrl(entry.id),
            name: fromArray(entry.fields.name),
            authors: fromArray(entry.fields.author),
            method: fromArray(entry.fields.method),
            resolution: fromArray(entry.fields.resolution),
            specimenState: fromArray(entry.fields.specimenstate),
        }));
    });
}

function fromArray(values: string[] | undefined): string | undefined {
    return values ? values[0] : undefined;
}

function getUrl(entry: ApiEntryResponse): string | undefined {
    const mainFieldUrl = entry.fieldURLs.find(field => field.name === "main");
    if (!mainFieldUrl) return;

    const path = mainFieldUrl.value.replace(/^\//, "");
    return `https://www.ebi.ac.uk/${path}`;
}
