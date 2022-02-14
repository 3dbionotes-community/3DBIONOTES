import _ from "lodash";
import { getName } from "../../data/repositories/protvista/utils";
import { subtracks } from "../definitions/subtracks";
import { Fragment2 } from "./Fragment2";
import { Subtrack, Track } from "./Track";

export type Annotations = TrackAnnotations[];

export interface TrackAnnotations {
    trackName: string;
    chain?: string;
    annotations: Annotation[];
}

export interface Annotation {
    type: string;
    description: string;
    color: string;
    start: number;
    end: number;
    index?: AnnotationIndex;
}

export interface AnnotationWithTrack extends Annotation {
    trackName: string;
}

export const indexValues = ["sequence", "structure"] as const;

export type AnnotationIndex = typeof indexValues[number];

export function getTracksFromAnnotations(annotationsCollection: Annotations): Track[] {
    return annotationsCollection.map(
        (extTrack): Track => ({
            id: extTrack.trackName,
            label: getName(extTrack.trackName),
            isCustom: true,
            subtracks: _(extTrack.annotations)
                .groupBy(o => o.type)
                .map(
                    (objs, type): Subtrack => {
                        return {
                            type: type,
                            accession: type,
                            label: getName(type),
                            shape: "rectangle",
                            locations: [
                                {
                                    fragments: objs.map(
                                        (obj): Fragment2 => {
                                            return {
                                                subtrack: subtracks.uploadData,
                                                start: obj.start,
                                                end: obj.end,
                                                description: obj.description,
                                                color: obj.color,
                                                chainId: extTrack.chain,
                                            };
                                        }
                                    ),
                                },
                            ],
                        };
                    }
                )
                .value(),
        })
    );
}

export function getAnnotationsFromAnnotationFromTrack(
    annotation: AnnotationWithTrack
): Annotations {
    return [
        {
            trackName: annotation.trackName,
            annotations: [
                {
                    type: annotation.type,
                    start: annotation.start,
                    end: annotation.end,
                    color: annotation.color,
                    description: annotation.description,
                },
            ],
        },
    ];
}
