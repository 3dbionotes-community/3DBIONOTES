import _ from "lodash";
import { Fragment } from "./Fragment";
import { Shape } from "./Shape";
import { SubtrackDefinition } from "./TrackDefinition";

export interface Track {
    id: string;
    label: string;
    overlapping?: boolean;
    subtracks: Subtrack[];
    description?: string;
}

export interface Subtrack {
    // TODO: Do we really need type/accesion/label? simplify
    type: string; // Displayed in tooltip title
    accession: string;
    shape: Shape;
    locations: Array<{ fragments: Fragment[] }>;
    label: string; // Supports: text and html.
    labelTooltip?: string; // Label tooltip content. Support text and HTML mark-up
    overlapping?: boolean;
    source?: SubtrackDefinition["source"];
}

export function addToTrack(options: {
    tracks: Track[];
    trackInfo: Pick<Track, "id" | "label">;
    subtracks: Subtrack[];
}): Track[] {
    const { tracks, trackInfo, subtracks } = options;
    const trackExists = _.some(tracks, track => track.id === trackInfo.id);

    if (trackExists) {
        return tracks.map(track => {
            if (track.id === trackInfo.id) {
                const newSubtracks = _(track.subtracks)
                    .concat(subtracks)
                    .groupBy(subtrack => subtrack.type)
                    .map(subtracks => {
                        const subtrack = subtracks[0];
                        if (!subtrack) throw "internal";
                        return { ...subtrack, locations: _.flatMap(subtracks, st => st.locations) };
                    })
                    .value();
                return { ...track, subtracks: newSubtracks };
            } else {
                return track;
            }
        });
    } else {
        const newTrack: Track = { ...trackInfo, subtracks };
        return [...tracks, newTrack];
    }
}

export function getTotalFeaturesLength(tracks: Track[]): number {
    return (
        _(tracks)
            .flatMap(track => track.subtracks)
            .flatMap(subtrack => subtrack.locations)
            .flatMap(location => location.fragments)
            .map(fragment => fragment.end)
            .max() || 0
    );
}

export function hasFragments(subtrack: Subtrack): boolean {
    return _.some(subtrack.locations, location => !_.isEmpty(location.fragments));
}
