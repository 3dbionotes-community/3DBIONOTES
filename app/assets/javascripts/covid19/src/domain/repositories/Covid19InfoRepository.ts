import { Covid19Info, Covid19Filter, FilterKey } from "../entities/Covid19Info";
import { FutureData } from "../entities/FutureData";

export interface Covid19InfoRepository {
    get(options: GetOptions): FutureData<Covid19Info>;
    search(options: SearchOptions): Covid19Info;
    autoSuggestions(search: string): string[];
}

export type SortingFields = "pdb" | "emdb" | "title" | "releaseDate";

export interface GetOptions {
    page?: number;
    pageSize?: number;
    filter: Partial<Record<FilterKey, boolean>>;
    sort: {
        field: SortingFields;
        order: "asc" | "desc";
    };
}

export interface SearchOptions {
    data: Covid19Info;
    search?: string;
    filter?: Covid19Filter;
}
