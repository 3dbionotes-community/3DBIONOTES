import _ from "lodash";
import { DbModel } from "../../domain/entities/DbModel";
import { FutureData } from "../../domain/entities/FutureData";
import { DbModelRepository, SearchOptions } from "../../domain/repositories/DbModelRepository";
import { SearchResults } from "../../domain/entities/SearchResults";
import { Future } from "../../utils/future";
import { assert } from "../../utils/ts-utils";
import { request } from "../request-utils";

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
    search(options: SearchOptions): FutureData<SearchResults> {
        const { type, query: query0, limit } = options;

        const query = query0.trim();
        const searchAllTypes = !type;
        const searchPdb = searchAllTypes || type === "pdb";
        const searchEmdb = searchAllTypes || type === "emdb";
        const pdbResults$ = searchFor(searchPdb, limit, config.pdb, query);
        const emdbResults$ = searchFor(searchEmdb, limit, config.emdb, query);

        return Future.join2(pdbResults$, emdbResults$).map(([pdbResults, emdbResults]) => {
            const items = _(pdbResults.items)
                .concat(emdbResults.items)
                .sortBy(model => -model.score)
                .value();

            return { query, items, totals: { pdb: pdbResults.total, emdb: emdbResults.total } };
        });
    }

    getEmdbsFromPdb(_pdbId: string): FutureData<string[]> {
        throw new Error("Not implemented");
    }

    getPdbsFromEmdb(_emdbId: string): FutureData<string[]> {
        throw new Error("Not implemented");
    }
}

const apiFields = ["name", "author", "method", "resolution", "specimenstate"] as const;

type ApiField = typeof apiFields[number];

interface ApiSearchParams {
    format: "JSON";
    size?: number;
    start?: number;
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

function searchFor(
    performSearch: boolean,
    limit: number,
    config: ItemConfig,
    query: string
): FutureData<{ items: DbModel[]; total: number }> {
    if (!performSearch) return Future.success({ items: [], total: 0 });

    const searchQuery = query.trim() ? query : emptySearchesByType[config.type];
    const params: ApiSearchParams = {
        format: "JSON",
        size: limit,
        start: 0,
        fields: apiFields.join(","),
        query: searchQuery.length >= 3 ? searchQuery.concat("*") : searchQuery,
        entryattrs: "score",
        fieldurl: true,
    };

    const pdbResults = request<ApiSearchResponse>({ url: config.searchUrl, params }).map(
        res => res.data
    );

    return pdbResults
        .map(res => {
            const items = res.entries.map(
                (entry): DbModel => ({
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
                })
            );

            const withoutDuplicates = _.uniqBy(items, ({ id }) => id); // Why note: Ebi is returning duplicated entries
            const hitCountWithoutDuplicates =
                res.hitCount - (items.length - withoutDuplicates.length);

            return { items: withoutDuplicates, total: hitCountWithoutDuplicates };
        })
        .flatMapError(err => {
            console.error(err);
            return Future.success({ items: [], total: 0 });
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
