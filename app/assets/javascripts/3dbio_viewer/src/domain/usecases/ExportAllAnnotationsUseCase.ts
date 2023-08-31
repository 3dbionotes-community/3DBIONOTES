import { Future } from "../../utils/future";
import { Maybe } from "../../utils/ts-utils";
import { FutureData } from "../entities/FutureData";
import { ExportDataRepository } from "../repositories/ExportDataRepository";
import i18n from "../utils/i18n";

export class ExportAllAnnotationsUseCase {
    constructor(private exportDataRepository: ExportDataRepository) {}

    execute(proteinId: Maybe<string>): FutureData<void> {
        if (!proteinId)
            return Future.error({
                message: i18n.t("Unable to download annotations without UniprotID."),
            });
        return this.exportDataRepository.exportAllAnnotations(proteinId);
    }
}
