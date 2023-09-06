import _ from "lodash";
import { Codec, number, optional, string, exactly, array, GetType } from "purify-ts";
import { Annotation, Annotations, TrackAnnotations } from "../domain/entities/Annotation";
import { FutureData } from "../domain/entities/FutureData";
import { UploadDataChain } from "../domain/entities/UploadData";
import { parseFromCodec } from "../utils/codec";
import { Maybe } from "../utils/ts-utils";
import { Track, hasFragments } from "../domain/entities/Track";

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

interface OptionArrayInfo {
    pdb: string;
    chain: string;
    uniprot: string;
    uniprotLength: number;
    uniprotTitle: string;
    organism: string;
    gene_symbol: string;
    path: string;
    pdbList?: string; // network-only
}

export const bioAnnotationsC = array(bioAnnotationTrackC);

export type BioAnnotations = GetType<typeof bioAnnotationsC>;

export function getAnnotationsFromJson(json: string): FutureData<Annotations> {
    return parseFromCodec(bioAnnotationsC, json).map(tracks => {
        return { tracks: getTrackAnnotations(tracks), data: json };
    });
}

export function getAnnotationsFromTracks(bioTracks: BioAnnotationTrack[]): Annotations {
    return { tracks: getTrackAnnotations(bioTracks), data: JSON.stringify(bioTracks) };
}

export function getTrackAnnotations(bioAnnotationTracks: BioAnnotationTrack[]): TrackAnnotations[] {
    return _(bioAnnotationTracks).map(getTrackAnnotationsItem).compact().value();
}

function getTrackAnnotationsItem(bioAnnotationTrack: BioAnnotationTrack): Maybe<TrackAnnotations> {
    // TODO: implement continous annotations
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
        return { name, pdbPath: uploadChain.pdbList, ...uploadChain };
    });
}

export function getBioAnnotationsFromTracks(tracks: Track[]): BioAnnotations {
    return tracks.map(track => ({
        track_name: track.label,
        visualization_type: undefined,
        chain: undefined,
        data: track.subtracks.flatMap(subtrack =>
            hasFragments(subtrack)
                ? subtrack.locations.flatMap(location =>
                      location.fragments.map(fragment => ({
                          begin: fragment.start,
                          end: fragment.end,
                          type: subtrack.type,
                          color: fragment.color,
                          description: fragment.description,
                      }))
                  )
                : []
        ),
    }));
}
