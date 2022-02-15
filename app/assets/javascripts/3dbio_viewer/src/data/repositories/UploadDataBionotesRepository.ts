import _ from "lodash";
import { FutureData } from "../../domain/entities/FutureData";
import { UploadData } from "../../domain/entities/UploadData";
import { UploadDataRepository } from "../../domain/repositories/UploadDataRepository";
import { routes } from "../../routes";
import { Future } from "../../utils/future";
import { getJSONData as getJSONOrError, getValidatedJSON } from "../request-utils";
import { Annotation, Annotations, TrackAnnotations } from "../../domain/entities/Annotation";
import { readFile } from "../../utils/files";
import { array, number, string, optional, exactly } from "purify-ts/Codec";
import { Codec, GetType } from "purify-ts/Codec";
import { parseFromCodec } from "../../utils/codec";
import { Maybe } from "../../utils/ts-utils";
import externalAnnotationsExample from "./external_annotations_example.json";
import { downloadFile } from "../../utils/download";

interface RecoverData {
    title: string;
    optionsArray: Array<[name: string, jsonInfo: string]>;
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

const apiAnnotationDataC = Codec.interface({
    begin: number,
    end: optional(number),
    type: optional(string),
    color: optional(string),
    description: optional(string),
});

const apiAnnotationTrackC = Codec.interface({
    track_name: string,
    visualization_type: optional(exactly("continuous")),
    chain: optional(string),
    data: array(apiAnnotationDataC),
});

type ApiAnnotationTrack = GetType<typeof apiAnnotationTrackC>;

const apiAnnotationsC = array(apiAnnotationTrackC);

export class UploadDataBionotesRepository implements UploadDataRepository {
    get(token: string): FutureData<UploadData> {
        const basePath = `${routes.bionotesDev}/upload/${token}`;
        const data$ = {
            recoverData: getJSONOrError<RecoverData>(`${basePath}/recover_data.json`),
            annotations: getValidatedJSON(`${basePath}/external_annotations.json`, apiAnnotationsC),
        };

        return Future.joinObj(data$).map(({ recoverData, annotations: apiAnnotations }) => {
            return {
                title: recoverData.title,
                chains: recoverData.optionsArray.map(([name, obj]) => {
                    const uploadChain = JSON.parse(obj) as OptionArrayInfo;
                    return { name, ...uploadChain };
                }),
                annotations: this.getTrackAnnotations(apiAnnotations || []),
            };
        });
    }

    getAnnotations(file: File): FutureData<Annotations> {
        return readFile(file).flatMap(contents => {
            return parseFromCodec(apiAnnotationsC, contents).map(apiAnnotations => {
                return this.getTrackAnnotations(apiAnnotations);
            });
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

    /* Private */

    private getTrackAnnotations(apiAnnotationTrack: ApiAnnotationTrack[]): TrackAnnotations[] {
        return _(apiAnnotationTrack)
            .map(track => this.getTrackAnnotationsItem(track))
            .compact()
            .value();
    }

    private getTrackAnnotationsItem(
        apiAnnotationTrack: ApiAnnotationTrack
    ): Maybe<TrackAnnotations> {
        // Only standard annotations are implemented
        if (apiAnnotationTrack.visualization_type) return;

        return {
            trackName: apiAnnotationTrack.track_name,
            chain: apiAnnotationTrack.chain,
            annotations: apiAnnotationTrack.data.map(
                (repoAnnotation): Annotation => {
                    return {
                        start: repoAnnotation.begin,
                        end: repoAnnotation.end || repoAnnotation.begin,
                        type: repoAnnotation.type || "data",
                        color: repoAnnotation.color || "#AAA",
                        description: repoAnnotation.description || "",
                    };
                }
            ),
        };
    }
}
