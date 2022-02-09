import { FutureData } from "../entities/FutureData";
import { UploadData } from "../entities/UploadData";

export interface UploadDataRepository {
    get(token: string): FutureData<UploadData>;
}
