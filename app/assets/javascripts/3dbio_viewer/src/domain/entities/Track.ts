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
