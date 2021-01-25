import _ from "lodash";
import { Track } from "../../../domain/entities/Track";
import { getId, getName } from "./utils";

export type Cv19Annotations = Cv19Annotation[];

export interface Cv19Annotation {
    track_name: string;
    visualization_type?: "variants"; // This type uses a different Data, implement if necessary
    acc: string;
    data: Cv19AnnotationData[];
    reference: string;
    fav_icon: string;
}

export interface Cv19AnnotationData {
    begin: number;
    end: number;
    partner_name: string;
    color: string;
    description: string;
    type: string;
}

export function getFunctionalMappingTrack(cv19Annotations: Cv19Annotations): Track | undefined {
    const mapping = cv19Annotations[0];
    if (!mapping) return;

    const mappingTracks = _(mapping.data)
        .groupBy(data => data.partner_name)
        .map((values, key) => ({ name: key, items: values }))
        .value();

    return {
        id: getId(mapping.track_name),
        label: getName(mapping.track_name),
        subtracks: mappingTracks.map(track => ({
            accession: getName(track.name),
            type: track.items[0].type,
            label: getName(track.name),
            labelTooltip: track.items[0].description,
            shape: "rectangle",
            locations: [
                {
                    fragments: track.items.map(item => ({
                        start: item.begin,
                        end: item.end,
                        description: item.description,
                        color: item.color,
                    })),
                },
            ],
        })),
    };
}
