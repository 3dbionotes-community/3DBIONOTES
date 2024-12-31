import { FutureData } from "../entities/FutureData";
import { Source } from "../entities/Source";

export interface SourcesRepository {
    get(): FutureData<Source[]>;
}
