import { Annotations } from "../entities/Annotation";
import { FutureData } from "../entities/FutureData";
import { UploadDataRepository } from "../repositories/UploadDataRepository";

export class GetAnnotationsFromUploadData {
    constructor(private uploadDataRepository: UploadDataRepository) {}

    execute(file: File): FutureData<Annotations> {
        return this.uploadDataRepository.getAnnotations(file);
    }
}
