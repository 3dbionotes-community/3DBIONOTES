import _ from "lodash";
import { subtracks } from "../../../../domain/definitions/subtracks";
import { getEvidencesFrom } from "../../../../domain/entities/Evidence";
import { FragmentResult, Fragments, getFragments } from "../../../../domain/entities/Fragment2";
import i18n from "../../../../webapp/utils/i18n";

// Example: http://3dbionotes.cnb.csic.es/api/annotations/IEDB/Uniprot/O14920

export type IedbAnnotationsResponse = IedbAnnotation[];

export interface IedbAnnotation {
    start: number;
    end: number;
    type: string; // "epitope";
    description: string; // "SEKKQPVDLGLLEEDDEFEEF";
    evidence: number;
}

export function getEpitomesFragments(iedb: IedbAnnotationsResponse): Fragments {
    return getFragments(
        iedb,
        (feature): FragmentResult => {
            return {
                subtrack: subtracks.linearEpitomes,
                description: i18n.t("Linear epitome"),
                start: feature.start,
                end: feature.end,
                evidences: getEvidencesFrom("IEDB", {
                    name: feature.evidence.toString(),
                    url: `http://www.iedb.org/epitope/${feature.evidence}`,
                }),
            };
        }
    );
}
