import _ from "lodash";
import { FragmentResult, Fragments, getFragments } from "../../../../domain/entities/Fragment2";
import {
    getDynamicSubtrackId,
    SubtrackDefinition,
} from "../../../../domain/entities/TrackDefinition";
import { groupedPairsBy } from "../../../../utils/ts-utils";
import { subtracks } from "../definitions";

// http://3dbionotes.cnb.csic.es/cv19_annotations/P0DTD1_annotations.json

export type Cv19Tracks = Cv19Track[];

export type Cv19Track =
    | Cv19FunctionalMappingLigandsTrack
    | Cv19FunctionalMappingPPITrack
    | Cv19DiamondDrugScreeningTrack;
//| Cv19GenomicVariantsTrack;

export interface Cv19BaseTrack {
    visualization_type?: "variants";
    acc: string;
    reference: string;
    fav_icon: string;
}

interface Cv19FunctionalMappingLigandsTrack extends Cv19BaseTrack {
    track_name: "Functional_mapping_Ligands";
    data: Cv19FunctionalAnnotation[];
}

interface Cv19FunctionalMappingPPITrack extends Cv19BaseTrack {
    track_name: "Functional_mapping_PPI";
    data: Cv19FunctionalAnnotation[];
}

interface Cv19DiamondDrugScreeningTrack extends Cv19BaseTrack {
    track_name: "Diamond_drug_screening";
    data: Cv19DiamondDrugScreeningAnnotation[];
}

type Cv19TrackName = Cv19Track["track_name"];

export interface Cv19FunctionalAnnotation {
    begin: number;
    end: number;
    partner_name: string;
    color: string;
    description: string;
    type: string;
}

export interface Cv19DiamondDrugScreeningAnnotation {
    begin: number;
    end: number;
    color: string;
    type: string;
    description: string;
    partner_name: string;
    modelId_in_multimodelPdb: [number, string];
    info: Record<string, unknown>;
}

type GetTrackType<Name extends Cv19TrackName> = Extract<Cv19Track, { track_name: Name }>;

function getTrack<TrackName extends Cv19TrackName>(
    tracks: Cv19Track[],
    name: TrackName
): GetTrackType<TrackName> | undefined {
    return tracks.find(track => track.track_name === name) as GetTrackType<TrackName> | undefined;
}

export function getFunctionalMappingFragments(tracks: Cv19Tracks): Fragments {
    return _.concat(
        getFragmentsFrom(tracks, "Functional_mapping_PPI", subtracks.functionalMappingPPI),
        getFragmentsFrom(tracks, "Functional_mapping_Ligands", subtracks.functionalMappingLigands),
        getFragmentsFrom(tracks, "Diamond_drug_screening", subtracks.panddaDrugScreeningDiamond)
    );
}

function getFragmentsFrom<TrackName extends Cv19TrackName>(
    tracks: Cv19Track[],
    name: TrackName,
    subtrack: SubtrackDefinition
): Fragments {
    const track = getTrack(tracks, name);
    if (!track) return [];

    const annotations = track.data || [];
    const annotationsByPartner = groupedPairsBy(annotations, annotation => annotation.partner_name);

    return _.flatMap(annotationsByPartner, ([partnerName, annotations]) => {
        const referenceAnnotation = _.first(annotations);
        if (!referenceAnnotation) return [];

        const fragmentSubtrack: SubtrackDefinition = {
            dynamicSubtrack: subtrack,
            id: getDynamicSubtrackId(subtrack, partnerName),
            name: partnerName,
            description: subtrack.description,
            shape: subtrack.shape,
            color: referenceAnnotation.color,
            subtype: subtrack.subtype,
            source: { url: track.reference, icon: track.fav_icon } || subtrack.source,
        };

        return getFragments(
            annotations,
            (annotation): FragmentResult => {
                return {
                    subtrack: fragmentSubtrack,
                    start: annotation.begin,
                    end: annotation.end,
                    description: annotation.description,
                };
            }
        );
    });
}
