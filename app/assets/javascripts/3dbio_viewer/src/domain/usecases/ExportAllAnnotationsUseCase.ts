import { Future } from "../../utils/future";
import { Maybe } from "../../utils/ts-utils";
import { FutureData } from "../entities/FutureData";
import { Emdb } from "../entities/Pdb";
import { AnnotationsExportRepository } from "../repositories/AnnotationsExportRepository";
import i18n from "../utils/i18n";

export class ExportAllAnnotationsUseCase {
    constructor(private annotationsExportRepository: AnnotationsExportRepository) {}

    execute(options: {
        proteinId: Maybe<string>;
        pdbId: Maybe<string>;
        chainId: string;
        emdbs: Emdb[];
    }): FutureData<void> {
        const { proteinId, pdbId } = options;
        if (!proteinId || !pdbId)
            return Future.error({
                message: i18n.t("Unable to download annotations without Uniprot ID / PDB ID."),
            });
        return this.annotationsExportRepository.exportAllAnnotations(options);
    }
}
