import { Color } from "./Color";
import { Evidence } from "./Evidence";
import { Legend } from "./Legend";

export interface Fragment {
    start: number;
    end: number;
    description: string;
    evidences?: Evidence[];
    color: Color;
    legend?: Legend;
}

interface LooseFragment extends Omit<Fragment, "start" | "end"> {
    start: number | string;
    end: number | string;
}

export function getFragment(looseFragment: LooseFragment): Fragment[] {
    const { start, end } = looseFragment;
    const startNum = Number(start);
    const endNum = Number(end);
    const fragment = { ...looseFragment, start: startNum, end: endNum };

    return isNaN(startNum) || isNaN(endNum) ? [] : [fragment];
}
