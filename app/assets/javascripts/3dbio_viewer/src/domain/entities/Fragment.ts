import { Color } from "./Color";

export interface Fragment {
    start: number;
    end: number;
    tooltipContent: string;
    color: Color;
}
