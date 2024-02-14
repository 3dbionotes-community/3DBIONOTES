import { Future } from "../../utils/future";
import { Maybe } from "../../utils/ts-utils";
import { Emdb } from "../entities/Pdb";
import { AnnotationsExportRepository } from "../repositories/AnnotationsExportRepository";
import i18n from "../utils/i18n";

export class ExportAllAnnotationsUseCase {
    constructor(private annotationsExportRepository: AnnotationsExportRepository) { }

    execute(options: {
        proteinId: Maybe<string>;
        pdbId: Maybe<string>;
        chainId: string;
        emdbs: Emdb[];
    }): Future<string, void> {
        const { pdbId } = options;
        if (!pdbId) return Future.error(
            i18n.t("Unable to download annotations without PDB ID.")
        );

        return this.annotationsExportRepository
            .exportAllAnnotations(options)
            .flatMapError(({ message }) => Future.error(message));
    }
}
