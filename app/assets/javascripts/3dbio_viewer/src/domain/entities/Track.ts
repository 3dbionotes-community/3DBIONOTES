import _ from "lodash";
import { Fragment } from "./Fragment";
import { Fragment2 } from "./Fragment2";
import { Shape } from "./Shape";
import { SubtrackDefinition } from "./TrackDefinition";

export interface Track {
    id: string;
    label: string;
    overlapping?: boolean;
    subtracks: Subtrack[];
    description?: string;
    isCustom: boolean;
}

// * @deprecated Should be replaced eventually by SubtrackDefinition
export interface Subtrack {
    // TODO: Do we really need type/accesion/label? simplify
    type: string; // Displayed in tooltip title
    accession: string;
    shape: Shape;
    locations: Array<{ fragments: (Fragment | Fragment2)[] }>;
    label: string; // Supports: text and html.
    labelTooltip?: string; // Label tooltip content. Support text and HTML mark-up
    overlapping?: boolean;
    source?: SubtrackDefinition["source"];
    isBlast?: SubtrackDefinition["isBlast"];
    subtype?: SubtrackDefinition["subtype"];
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
