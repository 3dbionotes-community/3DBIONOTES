import _ from "lodash";
import { FragmentResult, Fragments, getFragments } from "../../../../domain/entities/Fragment2";
import {
    getDynamicSubtrackId,
    SubtrackDefinition,
} from "../../../../domain/entities/TrackDefinition";
import { groupedPairsBy } from "../../../../utils/ts-utils";
import { subtracks } from "../definitions";

// http://localhost:3001/3dbionotes/cv19_annotations/P0DTC2_annotations.json

export type Cv19Tracks = Cv19Track[];

export interface Cv19Track {
    track_name: string;
    visualization_type?: "variants";
    acc: string;
    data: Cv19Annotation[];
    reference: string;
    fav_icon: string;
}

export interface Cv19Annotation {
    begin: number;
    end: number;
    partner_name: string;
    color: string;
    description: string;
    type: string;
}

export function getFunctionalMappingFragments(cv19Tracks: Cv19Tracks): Fragments {
    const tracksByName = _.keyBy(cv19Tracks, cv19Track => cv19Track.track_name);
    const ppiTrack = tracksByName["Functional_mapping_PPI"];
    if (!ppiTrack) return [];

    const annotationsByPartner = groupedPairsBy(ppiTrack.data, an => an.partner_name);

    return _.flatMap(annotationsByPartner, ([partnerName, ppiAnnotations]) => {
        const referenceAnnotation = _.first(ppiAnnotations);
        if (!referenceAnnotation) return [];
        const subtrackDef = subtracks.functionalMappingPPI;

        const subtrack: SubtrackDefinition = {
            dynamicSubtrack: subtracks.functionalMappingPPI,
            id: getDynamicSubtrackId(subtrackDef, partnerName),
            name: partnerName,
            source: subtrackDef.source,
            description: subtrackDef.description,
            color: referenceAnnotation.color,
            shape: "rectangle",
        };

        return getFragments(
            ppiAnnotations,
            (annotation): FragmentResult => {
                return {
                    subtrack,
                    start: annotation.begin,
                    end: annotation.end,
                    description: annotation.description,
                };
            }
        );
    });
}
