import { Color } from "../../../domain/entities/Color";
import { Shape } from "../../../domain/entities/Shape";
import { Variants } from "../../../domain/entities/Variant";

export interface PdbView {
    displayNavigation: boolean;
    displaySequence: boolean;
    displayConservation: boolean;
    displayVariants: boolean;
    offset?: number;
    legends?: {
        alignment: "left" | "right" | "center";
        data: Record<string, Array<{ color: Color[]; text: string }>>;
    };
    sequence: string;
    length: number;
    // https://github.com/ebi-webcomponents/nightingale/tree/master/packages/protvista-track#data-array
    tracks: TrackView[];
    variants?: Variants;
    sequenceConservation?: unknown;
}

export interface TrackView {
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
        locations: Array<{ fragments: FragmentView[] }>;
    }>;
}

export interface FragmentView {
    start: number;
    end: number;
    color: Color;
    tooltipContent: string;
}
