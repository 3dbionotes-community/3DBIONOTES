import { Covid19Info, EntityBodiesFilter } from "../entities/Covid19Info";

export interface Covid19InfoRepository {
    get(): Covid19Info;
    search(options: SearchOptions): Covid19Info;
    hasPdbRedoValidation(pdbId: string): Promise<boolean>;
}

export interface SearchOptions {
    data: Covid19Info;
    search?: string;
    filter?: EntityBodiesFilter;
}
