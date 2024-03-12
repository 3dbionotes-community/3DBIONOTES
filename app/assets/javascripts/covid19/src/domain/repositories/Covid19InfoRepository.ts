import { Covid19Info, Covid19Filter } from "../entities/Covid19Info";
import { FutureData } from "../entities/FutureData";

export interface Covid19InfoRepository {
    get(): FutureData<Covid19Info>;
    search(options: SearchOptions): Covid19Info;
    autoSuggestions(search: string): string[];
}

export interface SearchOptions {
    data: Covid19Info;
    search?: string;
    filter?: Covid19Filter;
}
