import { FutureData } from "../entities/FutureData";

export interface ExportDataRepository {
    exportAllAnnotations(pdbId: string): FutureData<void>;
}
