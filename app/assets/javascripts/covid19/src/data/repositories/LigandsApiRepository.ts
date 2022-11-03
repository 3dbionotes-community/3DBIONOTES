import _ from "lodash";
import { LigandImageData } from "../../domain/entities/LigandImageData";
import { LigandsRepository } from "../../domain/repositories/LigandsRepository";
import { routes } from "../../routes";
import { LigandToImageData, ligandToImageDataC } from "../LigandToImageData";
import { FutureData } from "../utils/future";
import { getValidatedJSON } from "../utils/request-utils";
import { Maybe } from "../utils/ts-utils";

export class LigandsApiRepository implements LigandsRepository {
    getImageDataResource(inChI: string): FutureData<Maybe<LigandImageData>> {
        const ligandToImageData$ = getValidatedJSON<LigandToImageData>(
            `${routes.bionotesApi}/ligandToImageData/${inChI}`,
            ligandToImageDataC
        ).map(ligandToImageData => {
            if (!ligandToImageData || ligandToImageData.detail) return undefined;
            const { imageData } = ligandToImageData;
            if (!imageData) return undefined;
            if (imageData.length > 1) {
                console.log("There is more than one IDR");
                return undefined;
            }
            const idr: any = _.first(imageData);
            return {
                ...idr,
                assays: idr.assays.map((assay: any) => {
                    const wellsOnPlates: any[][] = assay.screens
                        .find((screen: any) => screen.dbId === "2602")
                        ?.plates.map((plate: any) => plate.wells);
                    // console.log(wellsOnPlates);
                    const allPercentageInhibition = wellsOnPlates
                        ?.map((plate: any) =>
                            plate.flatMap((well: any) =>
                                well.percentageInhibition ? [`${well.percentageInhibition}%`] : []
                            )
                        )
                        .join(", ");
                    // console.log(allPercentageInhibition);

                    const cytotoxicity = assay.additionalAnalyses.find(
                        (analytic: any) => analytic.name === "CC50"
                    );
                    const doseResponse = assay.additionalAnalyses.find(
                        (analytic: any) => analytic.name === "IC50"
                    );
                    const cytotoxicIndex = assay.additionalAnalyses.find(
                        (analytic: any) => analytic.name === "Selectivity index"
                    );

                    return {
                        ...assay,
                        id: assay.dbId,
                        type: assay.assayType,
                        typeTermAccession: assay.assayTypeTermAccession,
                        screens: assay.screens.map((screen: any) => ({
                            ...screen,
                            id: screen.dbId,
                            doi: screen.dataDoi,
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
            } as LigandImageData;
        });
        return ligandToImageData$;
    }
}
