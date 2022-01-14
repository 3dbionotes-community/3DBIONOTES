import { Covid19Info } from "../entities/Covid19Info";

export interface Covid19InfoRepository {
    get(): Covid19Info;
}
