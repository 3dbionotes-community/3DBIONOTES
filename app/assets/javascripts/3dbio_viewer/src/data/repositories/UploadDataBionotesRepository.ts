import _ from "lodash";
import { FutureData } from "../../domain/entities/FutureData";
import { UploadData } from "../../domain/entities/UploadData";
import { UploadDataRepository } from "../../domain/repositories/UploadDataRepository";
import { routes } from "../../routes";
import { Future } from "../../utils/future";
import { getJSONData as getJSONOrError, getValidatedJSON } from "../request-utils";
import { Annotations } from "../../domain/entities/Annotation";
import { readFile } from "../../utils/files";
import externalAnnotationsExample from "./external_annotations_example.json";
import { downloadFile } from "../../utils/download";
import {
    bioAnnotationsC,
    getAnnotationsFromJson,
    getChainsFromOptionsArray,
    getTrackAnnotations,
    OptionsArray,
} from "../BionotesAnnotations";

interface RecoverData {
    title: string;
    optionsArray: OptionsArray;
}

export interface OptionArrayInfo {
    pdb: string;
    chain: string;
    uniprot: string;
    uniprotLength: number;
    uniprotTitle: string;
    organism: string;
    gene_symbol: string;
    path: string;
}

export class UploadDataBionotesRepository implements UploadDataRepository {
    get(token: string): FutureData<UploadData> {
        const basePath = `${routes.bionotesDev}/upload/${token}`;
        const data$ = {
            recoverData: getJSONOrError<RecoverData>(`${basePath}/recover_data.json`),
            annotations: getValidatedJSON(`${basePath}/external_annotations.json`, bioAnnotationsC),
        };

        return Future.joinObj(data$).map(
            ({ recoverData, annotations: apiAnnotations }): UploadData => {
                return {
                    title: recoverData.title,
                    chains: getChainsFromOptionsArray(recoverData.optionsArray),
                    annotations: getTrackAnnotations(apiAnnotations || []),
                };
            }
        );
    }

    getAnnotations(file: File): FutureData<Annotations> {
        return readFile(file).flatMap(contents => {
            return getAnnotationsFromJson(contents);
        });
    }

    downloadAnnotationsExample(): void {
        const json = JSON.stringify(externalAnnotationsExample, null, 4);
        downloadFile({
            data: json,
            filename: "external_annotations.json",
            mimeType: "application/json",
        });
    }
}
