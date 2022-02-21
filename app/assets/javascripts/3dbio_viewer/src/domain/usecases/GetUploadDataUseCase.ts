import { FutureData } from "../entities/FutureData";
import { UploadData } from "../entities/UploadData";
import { UploadDataRepository } from "../repositories/UploadDataRepository";

export class GetUploadDataUseCase {
    constructor(private uploadDataRepository: UploadDataRepository) {}

    execute(token: string): FutureData<UploadData> {
        return this.uploadDataRepository.get(token);
    }
}
