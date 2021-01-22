import _ from "lodash";
import { Fragment } from "./Fragment";
import { Shape } from "./Shape";

export interface Track {
    id: string;
    label: string;
    overlapping?: boolean;
    subtracks: Subtrack[];
}

export interface Subtrack {
    type: string; // Displayed in tooltip title
    accession: string;
    shape: Shape;
    locations: Array<{ fragments: Fragment[] }>;
    label: string; // Supports: text and html.
    labelTooltip?: string; // Label tooltip content. Support text and HTML mark-up
    overlapping?: boolean;
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
                return { ...track, subtracks: track.subtracks.concat(subtracks) };
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
