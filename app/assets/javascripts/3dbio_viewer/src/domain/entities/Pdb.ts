import { Color } from "./Color";
import { Protein } from "./Protein";
import { Track } from "./Track";
import { Variants } from "./Variant";

export interface Pdb {
    protein: Protein;
    sequence: string;
    length: number;
    // https://github.com/ebi-webcomponents/nightingale/tree/master/packages/protvista-track#data-array
    tracks: Track[];
    variants?: Variants;
    sequenceConservation?: unknown;
    legends?: {
        alignment: "left" | "right" | "center";
        data: Record<string, Array<{ color: Color[]; text: string }>>;
    };
}
