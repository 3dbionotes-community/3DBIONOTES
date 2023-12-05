import { Fragments } from "../../../../domain/entities/Fragment2";
import { NMRFragmentTarget } from "../../../../domain/entities/Protein";
import { subtracks } from "../definitions";

export function getNMRFragments(nmr: NMRFragmentTarget[]): Fragments {
    return nmr.flatMap(target => ({
        subtrack: subtracks.nmr,
        start: target.start,
        end: target.end,
    }));
}
