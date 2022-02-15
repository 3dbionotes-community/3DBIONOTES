import { Annotations } from "../entities/Annotation";
import { FutureData } from "../entities/FutureData";
import { UploadData } from "../entities/UploadData";

export interface UploadDataRepository {
    get(token: string): FutureData<UploadData>;
    getAnnotations(file: File): FutureData<Annotations>;
    downloadAnnotationsExample(): void;
}
