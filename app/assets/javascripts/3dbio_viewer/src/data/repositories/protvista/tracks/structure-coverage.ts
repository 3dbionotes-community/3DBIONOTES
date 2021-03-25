import _ from "lodash";
import { Fragments, getFragments } from "../../../../domain/entities/Fragment2";
import { Track } from "../../../../domain/entities/Track";
import { config } from "../config";
import { subtracks } from "../definitions";

export interface Coverage {
    "Structure coverage"?: Array<{ start: number; end: number }>;
}

export function getStructureCoverageFragments(coverage: Coverage): Fragments {
    const itemKey = "region";
    const trackConfig = config.tracks[itemKey];
    const name = "Region";
    const items = coverage["Structure coverage"];
    if (!items) return [];

    return getFragments(coverage["Structure coverage"] || [], item => ({
        subtrack: subtracks.structureCoverage,
        start: item.start,
        end: item.end,
        description: "Sequence segment covered by the structure",
        color: config.colorByTrackName[itemKey],
    }));
}
