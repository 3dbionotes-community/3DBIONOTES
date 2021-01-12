import { Fragment } from "./Fragment";
import { Shape } from "./Shape";

export interface Track {
    id: string;
    label: string;
    labelType: "text" | "html";
    overlapping?: boolean;
    data: Array<{
        accession: string;
        type: string; // Displayed in tooltip title
        label: string; // Supports: text and html.
        labelTooltip: string; // Label tooltip content. Support text and HTML mark-up
        overlapping?: boolean;
        shape: Shape;
        locations: Array<{ fragments: Fragment[] }>;
    }>;
}
