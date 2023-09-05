import { Future } from "../../utils/future";
import { Maybe } from "../../utils/ts-utils";
import { FutureData } from "../entities/FutureData";
import { Emdb } from "../entities/Pdb";
import { ExportDataRepository } from "../repositories/ExportDataRepository";
import i18n from "../utils/i18n";

export class ExportAllAnnotationsUseCase {
    constructor(private exportDataRepository: ExportDataRepository) {}

    execute(props: {
        proteinId: Maybe<string>;
        pdbId: Maybe<string>;
        chainId: string;
        emdbs: Emdb[];
    }): FutureData<void> {
        const { proteinId, pdbId } = props;
        if (!proteinId || !pdbId)
            return Future.error({
                message: i18n.t("Unable to download annotations without Uniprot ID / PDB ID."),
            });
        return this.exportDataRepository.exportAllAnnotations(props).flatMapError(err => {
            alert(err.message);
            return Future.error(err);
        });
    }
}
