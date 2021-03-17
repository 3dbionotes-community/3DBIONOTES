import Constants from "../../data/repositories/protvista/tracks/legacy/Constants";
import { Color } from "./Color";
import { Evidence } from "./Evidence";
import { Legend } from "./Legend";
import { Link } from "./Link";
import { Subtrack } from "./Track";

/**
 * @deprecated Use Fragment2 instead
 */
export interface Fragment {
    id?: string;
    type?: string;
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

export function getFragmentToolsLink(options: {
    protein: string;
    subtrack: Subtrack;
    fragment: Fragment;
}): Link | undefined {
    const { protein, subtrack, fragment } = options;

    if (isBlastFragment(subtrack, fragment)) {
        return { name: "BLAST", url: getBlastUrl(protein, subtrack, fragment) };
    }
}

const noBlastTypes = Constants.getNoBlastTypes();

export function isBlastFragment(subtrack: Subtrack, fragment: Fragment): boolean {
    const type = subtrack.type;
    return type !== undefined && fragment.end - fragment.start >= 3 && !noBlastTypes.includes(type);
}
export function getBlastUrl(protein: string, subtrack: Subtrack, fragment: Fragment): string {
    // Example: https://www.uniprot.org/blast/?about=P0DTC2[816-1273]&key=Chain&id=PRO_0000449649
    const baseUrl = "https://www.uniprot.org/blast";
    const trackInfo: { label: string } | undefined = Constants.getTrackInfo(subtrack.type);
    const params = [
        `about=${protein}[${fragment.start}-${fragment.end}]`,
        trackInfo ? `key=${trackInfo.label}` : null,
        fragment.id ? `id=${fragment.id}` : null,
    ];
    const paramsString = params.filter(param => !!param).join("&");

    return `${baseUrl}?${paramsString}`;
}
