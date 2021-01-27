import { Color } from "./Color";
import { Legend } from "./Legend";

export interface Fragment {
    start: number;
    end: number;
    description: string;
    color: Color;
    legend?: Legend;
}

interface LooseFragment extends Omit<Fragment, "start" | "end"> {
    start: number | string;
    end: number | string;
}

export function getFragment(fragmentWithLooseStartEnd: LooseFragment): Fragment[] {
    const { start, end } = fragmentWithLooseStartEnd;
    const start2 = Number(start);
    const end2 = Number(end);

    const fragment = { ...fragmentWithLooseStartEnd, start: start2, end: end2 };

    return isNaN(start2) || isNaN(end2) ? [] : [fragment];
}
