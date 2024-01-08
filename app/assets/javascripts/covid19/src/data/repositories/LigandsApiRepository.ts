import _ from "lodash";
import { getPdbLigand, PdbEntryResponse, pdbEntryResponseC } from "../LigandToImageData";
import { LigandImageData } from "../../domain/entities/LigandImageData";
import { LigandsRepository } from "../../domain/repositories/LigandsRepository";
import { routes } from "../../routes";
import { Future } from "../utils/future";
import { getValidatedJSON } from "../utils/request-utils";
import { IDROptions } from "../../domain/usecases/GetLigandImageDataResourcesUseCase";
import { FutureData } from "../../domain/entities/FutureData";
import i18n from "../../utils/i18n";

export class LigandsApiRepository implements LigandsRepository {
    getImageDataResource(
        inChI: string,
        pdbId: string,
        idrOptions: IDROptions
    ): FutureData<LigandImageData> {
        const { bionotesApi } = routes;
        const { ontologies, ontologyTerms, organisms } = idrOptions;
        const pdbEntryLigands$ = getValidatedJSON<PdbEntryResponse>(
            `${bionotesApi}/pdbentry/${pdbId}/ligands/`,
            pdbEntryResponseC
        )
            .map(pdbEntryRes => {
                return pdbEntryRes?.results.find(r => r.IUPACInChIkey === inChI);
            })
            .flatMap(
                (ligand): FutureData<LigandImageData> => {
                    if (!ligand)
                        return Future.error(err(i18n.t("Error from API: No ligands found.")));
                    const idr = getPdbLigand({ ligand, ontologies, ontologyTerms, organisms })
                        .imageDataResource;
                    if (!idr)
                        return Future.error(
                            err(i18n.t("IDR might be present, but we were unable to retrieve it."))
                        );
                    return Future.success(idr);
                }
            );

        return pdbEntryLigands$;
    }
}

function err(message: string) {
    return { message: i18n.t(message, { nsSeparator: false }) };
}
