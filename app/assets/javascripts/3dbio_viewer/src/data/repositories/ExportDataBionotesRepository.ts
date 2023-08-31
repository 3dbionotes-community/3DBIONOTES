import { FutureData, fromPromise } from "../../domain/entities/FutureData";
import { ExportDataRepository } from "../../domain/repositories/ExportDataRepository";
import { Future } from "../../utils/future";
import { routes } from "../../routes";
import { downloadBlob, downloadFile } from "../../utils/download";
import { RequestError, getJSONData } from "../request-utils";
import { Features } from "./protvista/tracks/feature";
import { EbiVariation } from "./protvista/tracks/variants";
import JSZip from "jszip";
import _ from "lodash";

interface Data {
    features: Features;
    variation: EbiVariation;
}

type DataRequests = { [K in keyof Data]-?: Future<RequestError, Data[K] | undefined> };

export interface AnnotationsFile {
    blob: Blob;
    filename: string;
}

export class ExportDataBionotesRepository implements ExportDataRepository {
    exportAllAnnotations(proteinId: string): FutureData<void> {
        const { ebi: ebiBaseUrl } = routes;
        const ebiProteinsApiUrl = `${ebiBaseUrl}/proteins/api`;

        const data$: DataRequests = {
            features: getJSONData(`${ebiProteinsApiUrl}/features/${proteinId}`),
            variation: getJSONData(`${ebiProteinsApiUrl}/variation/${proteinId}`),
        };

        return Future.joinObj(data$).flatMap(data => {
            return this.generateZip(
                _.toPairs(data).map(([key, value]) => ({
                    blob: new Blob([JSON.stringify(value)], { type: "application/json" }),
                    filename: `uniprot_${proteinId}_${key}.json`,
                }))
            ).map(zipBlob => downloadBlob({ blob: zipBlob, filename: "protVistaData.zip" }));
        });
    }

    private generateZip(files: AnnotationsFile[]): FutureData<Blob> {
        const zip = new JSZip();
        files.forEach(file => zip.file(file.filename, file.blob));
        return fromPromise(zip.generateAsync({ type: "blob" }));
    }
}
