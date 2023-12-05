import { Fragments } from "../../../../domain/entities/Fragment2";
import { NMRTarget } from "../../../NMRTarget";
import { subtracks } from "../definitions";

export function getNMRSubtrack(target: NMRTarget[]): Fragments {
    return target.map(t => ({
        subtrack: subtracks.nmr,
        start: t.start,
        end: t.end,
        description: t.entity,
        color: "#f00",
    }));
}
