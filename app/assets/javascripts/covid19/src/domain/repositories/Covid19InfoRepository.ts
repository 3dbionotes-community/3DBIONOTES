import { Covid19Info, Covid19Filter } from "../entities/Covid19Info";

export interface Covid19InfoRepository {
    get(): Covid19Info;
    search(options: SearchOptions): Covid19Info;
}

export interface SearchOptions {
    search?: string;
    filter?: Covid19Filter;
}
