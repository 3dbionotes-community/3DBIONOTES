import _ from "lodash";
import { subtracks } from "../../../../domain/definitions/subtracks";
import { Evidence } from "../../../../domain/entities/Evidence";
import { FragmentResult, Fragments, getFragments } from "../../../../domain/entities/Fragment2";
import i18n from "../../../../webapp/utils/i18n";
import { config } from "../config";

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
                evidences: getEvidences(feature),
                color: config.colorByTrackName.linear_epitope,
            };
        }
    );
}

function getEvidences(feature: IedbAnnotation): Evidence[] {
    const evidence: Evidence = {
        title: i18n.t("Imported information"),
        sources: [
            {
                name: i18n.t("Imported from IEDB"),
                links: [
                    {
                        name: feature.evidence.toString(),
                        url: `http://www.iedb.org/epitope/${feature.evidence}`,
                    },
                ],
            },
        ],
    };

    return [evidence];
}
