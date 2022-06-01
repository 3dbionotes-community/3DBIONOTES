import _ from "lodash";
import { FragmentResult, Fragments, getFragments } from "../../../../domain/entities/Fragment2";
import i18n from "../../../../domain/utils/i18n";
import { subtracks } from "../definitions";

export interface Coverage {
    "Structure coverage"?: Array<{ start: number; end: number }>;
}

export function getStructureCoverageFragments(coverage: Coverage, chainId: string): Fragments {
    return getFragments(
        coverage["Structure coverage"] || [],
        (item): FragmentResult => ({
            subtrack: subtracks.structureCoverage,
            start: item.start,
            end: item.end,
            description: i18n.t("Sequence segment covered by the structure"),
            chainId,
        })
    );
}
