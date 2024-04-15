import { FutureData } from "../../domain/entities/FutureData";
import { Source } from "../../domain/entities/Source";
import { SourcesRepository } from "../../domain/repositories/SourcesRepository";
import { Future } from "../utils/future";

export class ApiSourcesRepository implements SourcesRepository {
    get(): FutureData<Source[]> {
        return Future.success([]);
    }
}
