import { Track } from "../entities/Track";
import { AnnotationsExportRepository } from "../repositories/AnnotationsExportRepository";

export class ExportAnnotationsUseCase {
    constructor(private annotationsExportRepository: AnnotationsExportRepository) {}

    execute(blockId: string, tracks: Track[], chain: string): void {
        return this.annotationsExportRepository.exportAnnotations(blockId, tracks, chain);
    }
}
