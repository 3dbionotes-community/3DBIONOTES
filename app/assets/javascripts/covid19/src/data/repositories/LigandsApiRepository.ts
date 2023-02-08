import _ from "lodash";
import { ImageDataResource, pdbEntryLigandsC, PdbEntryLigandsResponse } from "../LigandToImageData";
import { LigandImageData } from "../../domain/entities/LigandImageData";
import { LigandsRepository } from "../../domain/repositories/LigandsRepository";
import { routes } from "../../routes";
import { Error, Future, FutureData } from "../utils/future";
import { getValidatedJSON } from "../utils/request-utils";
import i18n from "../../utils/i18n";

export class LigandsApiRepository implements LigandsRepository {
    getImageDataResource(inChI: string, pdbId: string): FutureData<LigandImageData> {
        const pdbEntryLigands$ = getValidatedJSON<PdbEntryLigandsResponse>(
            `${routes.bionotesApi}/pdbentry/${pdbId}/ligands/`,
            pdbEntryLigandsC
        )
            .map(pdbEntryRes => {
                return pdbEntryRes?.results.find(r => r.IUPACInChIkey === inChI);
            })
            .flatMapError<Error>(() =>
                Future.error(err("Error: the api response type was not the expected."))
            )
            .flatMap(
                (ligandToImageData): FutureData<LigandImageData> => {
                    if (!ligandToImageData)
                        return Future.error(err("Error: the api response is undefined."));

                    const data = ligandToImageData;
                    const { imageData } = data;

                    if (!imageData) return Future.error(err("Error: imageData is undefined."));
                    else if (imageData.length > 1)
                        return Future.error(err("Error: there is more than one IDR."));
                    //it shouldn't be an array...
                    else if (_.isEmpty(imageData))
                        return Future.error(err("Error: imageData is empty."));

                    const idr = _.first(imageData) as ImageDataResource;

                    return Future.success<LigandImageData, Error>({
                        ...idr,
                        externalLink: data.externalLink,
                        assays: idr.assays.map(assay => {
                            const {
                                screens,
                                additionalAnalyses,
                                dbId,
                                assayType,
                                assayTypeTermAccession,
                            } = assay;

                            //Compound: inhibition cytopathicity
                            const wellsFromPlates = screens
                                .find(({ dbId }) => dbId === "2602")
                                ?.plates.map(({ wells }) => wells);
                            const allPercentageInhibition = wellsFromPlates
                                ?.map(plate =>
                                    plate.flatMap(({ percentageInhibition }) =>
                                        percentageInhibition ? [`${percentageInhibition}%`] : []
                                    )
                                )
                                .join(", "); //it should be only one...¿?, but just in case...

                            //Compounds: cytotoxicity, dose response, cytotoxic index
                            const cytotoxicity = additionalAnalyses.find(
                                ({ name }) => name === "CC50"
                            );
                            const doseResponse = additionalAnalyses.find(
                                ({ name }) => name === "IC50"
                            );
                            const cytotoxicIndex = additionalAnalyses.find(
                                ({ name }) => name === "Selectivity index"
                            );

                            return {
                                ...assay,
                                id: dbId,
                                type: assayType,
                                typeTermAccession: assayTypeTermAccession,
                                screens: screens.map(screen => ({
                                    ...screen,
                                    id: screen.dbId,
                                    doi: screen.dataDoi,
                                    well: _.first(_.first(screen.plates)?.wells)?.externalLink,
                                })),
                                compound: {
                                    percentageInhibition: allPercentageInhibition,
                                    cytotoxicity: cytotoxicity
                                        ? `${cytotoxicity.value} ${cytotoxicity.units ?? ""}`
                                        : undefined,
                                    cytotoxicityIndex: cytotoxicIndex
                                        ? `${cytotoxicIndex.value} ${cytotoxicIndex.units ?? ""}`
                                        : undefined,
                                    doseResponse: doseResponse
                                        ? `${doseResponse.value} ${doseResponse.units ?? ""}`
                                        : undefined,
                                },
                            };
                        }),
                    });
                }
            );
        return pdbEntryLigands$;
    }
}

function err(message: string) {
    return { message: i18n.t(message, { nsSeparator: false }) };
}
