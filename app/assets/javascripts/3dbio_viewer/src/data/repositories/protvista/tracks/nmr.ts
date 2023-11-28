import _ from "lodash";
import { Fragments } from "../../../../domain/entities/Fragment2";
import { NMRTarget } from "../../../../domain/entities/Protein";
import { subtracks } from "../definitions";

export function getNMRFragments(nmr: NMRTarget[]): Fragments {
    return nmr.flatMap(target => ({
        subtrack: subtracks.nmr,
        start: target.start,
        end: target.end,
    }));
}
