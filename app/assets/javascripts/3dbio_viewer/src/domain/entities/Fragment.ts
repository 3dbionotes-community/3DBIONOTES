import Constants from "../../data/repositories/protvista/tracks/legacy/Constants";
import { Color } from "./Color";
import { Evidence } from "./Evidence";
import { Legend } from "./Legend";
import { Link } from "./Link";

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

export function getFragmentToolsLink(protein: string, fragment: Fragment): Link | undefined {
    if (isBlastFragment(fragment)) {
        return { name: "BLAST", url: getBlastUrl(protein, fragment) };
    }
}

const noBlastTypes = Constants.getNoBlastTypes();

export function isBlastFragment(fragment: Fragment): boolean {
    return (
        fragment.type !== undefined &&
        fragment.end - fragment.start >= 3 &&
        !noBlastTypes.includes(fragment.type)
    );
}
export function getBlastUrl(protein: string, fragment: Fragment): string {
    // Example: https://www.uniprot.org/blast/?about=P0DTC2[816-1273]&key=Chain&id=PRO_0000449649
    const baseUrl = "https://www.uniprot.org/blast";
    const params = [
        `about=${protein}[${fragment.start}-${fragment.end}]`,
        `key=${Constants.getTrackInfo(fragment.type).label}`,
        fragment.id ? `id=${fragment.id}` : null,
    ];
    const paramsString = params.filter(param => !!param).join("&");

    return `${baseUrl}?${paramsString}`;
}
