import _ from "lodash";
import { Codec, number, optional, string, exactly, array, GetType } from "purify-ts";
import { Annotation, Annotations, TrackAnnotations } from "../domain/entities/Annotation";
import { FutureData } from "../domain/entities/FutureData";
import { UploadDataChain } from "../domain/entities/UploadData";
import { parseFromCodec } from "../utils/codec";
import { Maybe } from "../utils/ts-utils";
import { OptionArrayInfo } from "./repositories/UploadDataBionotesRepository";

const bioAnnotationDataC = Codec.interface({
    begin: number,
    end: optional(number),
    type: optional(string),
    color: optional(string),
    description: optional(string),
});

const bioAnnotationTrackC = Codec.interface({
    track_name: string,
    visualization_type: optional(exactly("continuous")),
    chain: optional(string),
    data: array(bioAnnotationDataC),
});

type BioAnnotationTrack = GetType<typeof bioAnnotationTrackC>;

export type OptionsArray = Array<[proteinName: string, jsonInfo: string]>;

export const bioAnnotationsC = array(bioAnnotationTrackC);

export type BioAnnotations = GetType<typeof bioAnnotationsC>;

export function getAnnotationsFromJson(json: string): FutureData<Annotations> {
    return parseFromCodec(bioAnnotationsC, json).map(bionotesAnnotations => {
        return getTrackAnnotations(bionotesAnnotations);
    });
}

export function getTrackAnnotations(bioAnnotationTrack: BioAnnotationTrack[]): TrackAnnotations[] {
    return _(bioAnnotationTrack).map(getTrackAnnotationsItem).compact().value();
}

function getTrackAnnotationsItem(bioAnnotationTrack: BioAnnotationTrack): Maybe<TrackAnnotations> {
    // Only standard annotations are implemented
    if (bioAnnotationTrack.visualization_type) return;

    return {
        trackName: bioAnnotationTrack.track_name,
        chain: bioAnnotationTrack.chain,
        annotations: bioAnnotationTrack.data.map(
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

export function getChainsFromOptionsArray(optionsArray: OptionsArray): UploadDataChain[] {
    return optionsArray.map(([name, obj]) => {
        const uploadChain = JSON.parse(obj) as OptionArrayInfo;
        return { name, ...uploadChain };
    });
}
