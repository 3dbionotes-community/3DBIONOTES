import { Color } from "../../../domain/entities/Color";
import { Pdb } from "../../../domain/entities/Pdb";
import { Track } from "../../../domain/entities/Track";
import { Variants } from "../../../domain/entities/Variant";

export interface PdbProtvistaData extends Pdb {
    displayNavigation: boolean;
    displaySequence: boolean;
    displayConservation: boolean;
    displayVariants: boolean;
    offset?: number;
    legends?: {
        alignment: "left" | "right" | "center";
        data: Record<string, Array<{ color: Color[]; text: string }>>;
    };
}
