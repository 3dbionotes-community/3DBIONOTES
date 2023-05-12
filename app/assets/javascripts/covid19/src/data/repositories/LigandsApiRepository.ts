import _ from "lodash";
import { getPdbLigand, PdbEntryResponse, pdbEntryResponseC } from "../LigandToImageData";
import { LigandImageData } from "../../domain/entities/LigandImageData";
import { LigandsRepository } from "../../domain/repositories/LigandsRepository";
import { routes } from "../../routes";
import { Future } from "../utils/future";
import { getValidatedJSON } from "../utils/request-utils";
import { IDROptions } from "../../domain/usecases/GetLigandImageDataResourcesUseCase";
import { FutureData } from "../../domain/entities/FutureData";
import { Maybe } from "../utils/ts-utils";
import i18n from "../../utils/i18n";

export class LigandsApiRepository implements LigandsRepository {
    getImageDataResource(
        inChI: string,
        pdbId: string,
        idrOptions: IDROptions
    ): FutureData<Maybe<LigandImageData>> {
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
                (ligand): FutureData<Maybe<LigandImageData>> =>
                    ligand
                        ? Future.success(
                              getPdbLigand({ ligand, ontologies, ontologyTerms, organisms })
                                  .imageDataResource
                          )
                        : Future.error(err("Error from API: No ligands found"))
            );

        return pdbEntryLigands$;
    }
}

function err(message: string) {
    return { message: i18n.t(message, { nsSeparator: false }) };
}
