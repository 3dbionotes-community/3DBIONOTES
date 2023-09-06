import { Track } from "../entities/Track";
import { ExportDataRepository } from "../repositories/ExportDataRepository";

export class ExportAnnotationsUseCase {
    constructor(private exportDataRepository: ExportDataRepository) {}

    execute(blockId: string, tracks: Track[]): void {
        return this.exportDataRepository.exportAnnotations(blockId, tracks);
    }
}
