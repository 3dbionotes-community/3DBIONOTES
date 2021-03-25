import _ from "lodash";
import { Fragments, getFragments } from "../../../../domain/entities/Fragment2";
import i18n from "../../../../domain/utils/i18n";
import { config } from "../config";
import { subtracks } from "../definitions";

export interface Coverage {
    "Structure coverage"?: Array<{ start: number; end: number }>;
}

export function getStructureCoverageFragments(coverage: Coverage): Fragments {
    return getFragments(coverage["Structure coverage"] || [], item => ({
        subtrack: subtracks.structureCoverage,
        start: item.start,
        end: item.end,
        description: i18n.t("Sequence segment covered by the structure"),
        color: config.colorByTrackName.region,
    }));
}
