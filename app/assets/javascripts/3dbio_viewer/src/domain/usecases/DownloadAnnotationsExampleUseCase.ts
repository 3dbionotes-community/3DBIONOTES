import { UploadDataRepository } from "../repositories/UploadDataRepository";

export class DownloadAnnotationsExampleUseCase {
    constructor(private uploadDataRepository: UploadDataRepository) {}

    execute() {
        return this.uploadDataRepository.downloadAnnotationsExample();
    }
}
