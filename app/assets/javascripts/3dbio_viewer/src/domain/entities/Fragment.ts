import { Color } from "./Color";
import { Legend } from "./Legend";

export interface Fragment {
    start: number;
    end: number;
    description: string;
    color: Color;
    legend?: Legend;
}
