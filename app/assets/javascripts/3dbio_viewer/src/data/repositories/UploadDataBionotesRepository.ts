import _ from "lodash";
import { FutureData } from "../../domain/entities/FutureData";
import { UploadData } from "../../domain/entities/UploadData";
import { UploadDataRepository } from "../../domain/repositories/UploadDataRepository";
import { routes } from "../../routes";
import { Future } from "../../utils/future";
import { getJSON, getJSONData as getJSONOrError } from "../request-utils";
import {
    Annotations,
    getTracksFromAnnotations,
    TrackAnnotations,
} from "../../domain/entities/Annotation";
import { readFile } from "../../utils/files";

interface RecoverData {
    title: string;
    optionsArray: Array<[name: string, jsonInfo: string]>;
}

export interface OptionArrayInfo {
    pdb: string;
    chain: string;
    uniprot: string; // protein
    uniprotLength: number;
    uniprotTitle: string;
    organism: string;
    gene_symbol: string;
    path: string;
}

type ExternalAnnotations = ExternalAnnotationTrack[];

interface ExternalAnnotationTrack {
    track_name: string;
    chain?: string;
    data: ExternalAnnotationData[];
}

interface ExternalAnnotationData {
    begin: number;
    end: number;
    type: string;
    color: string;
    description: string;
}

export class UploadDataBionotesRepository implements UploadDataRepository {
    get(token: string): FutureData<UploadData> {
        const basePath = `${routes.bionotesDev}/upload/${token}`;
        const data$ = {
            recoverData: getJSONOrError<RecoverData>(`${basePath}/recover_data.json`),
            annotations: getJSON<ExternalAnnotations>(`${basePath}/external_annotations.json`),
        };

        return Future.joinObj(data$).map(({ recoverData, annotations: extAnnotations }) => {
            const annotations = (extAnnotations || []).map(this.getAnnotationTrack.bind(this));
            return {
                title: recoverData.title,
                chains: recoverData.optionsArray.map(([name, obj]) => {
                    const uploadChain = JSON.parse(obj) as OptionArrayInfo;
                    return { name, ...uploadChain };
                }),
                annotations,
            };
        });
    }

    getAnnotations(file: File): FutureData<Annotations> {
        return readFile(file).flatMap(contents => {
            // TODO: Check with purify-ts Codec. unknown -> ExternalAnnotations
            const repoAnnotations = JSON.parse(contents) as ExternalAnnotations;
            const annotations = repoAnnotations.map(this.getAnnotationTrack.bind(this));
            return Future.success(annotations);
        });
    }

    private getAnnotationTrack(repoAnnotationTrack: ExternalAnnotationTrack): TrackAnnotations {
        return {
            trackName: repoAnnotationTrack.track_name,
            chain: repoAnnotationTrack.chain,
            annotations: repoAnnotationTrack.data.map(repoAnnotation => {
                return {
                    ..._.omit(repoAnnotation, ["begin"]),
                    start: repoAnnotation.begin,
                };
            }),
        };
    }
}
