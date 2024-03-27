import { Covid19Info, Covid19Filter } from "../entities/Covid19Info";
import { FutureData } from "../entities/FutureData";

export interface Covid19InfoRepository {
    get(options: GetOptions): FutureData<Covid19Info>;
    autoSuggestions(search: string): FutureData<string[]>;
}

export type SortingFields = "pdb" | "emdb" | "title" | "releaseDate";

export interface GetOptions {
    page?: number;
    pageSize?: number;
    filter: Partial<Covid19Filter>;
    sort: {
        field: SortingFields;
        order: "asc" | "desc";
    };
    query?: string;
}
