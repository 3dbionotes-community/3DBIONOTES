import _ from "lodash";
import { Evidence } from "../../../../domain/entities/Evidence";
import { Fragment, getFragment } from "../../../../domain/entities/Fragment";
import { Track } from "../../../../domain/entities/Track";
import { config } from "../config";

export type Iedb = IedbFeature[];

export interface IedbFeature {
    start: number;
    end: number;
    type: string; // "epitope";
    description: string; // "SEKKQPVDLGLLEEDDEFEEF";
    evidence: number;
}

export function getEpitomesTrack(iedb: Iedb): Track {
    const label = config.tracks.linear_epitope.label;

    return {
        id: "epitomes",
        label: "Epitomes",
        subtracks: [
            {
                accession: "linear-epitome",
                type: label,
                label: label,
                shape: config.shapeByTrackName.linear_epitope,
                locations: [
                    {
                        fragments: _.flatMap(iedb, feature =>
                            getFragment({
                                description: "Linear epitome",
                                type: feature.type,
                                start: feature.start,
                                end: feature.end,
                                evidences: getEvidences(feature),
                                color: config.colorByTrackName.linear_epitope,
                            })
                        ),
                    },
                ],
            },
        ],
    };
}

function getEvidences(feature: IedbFeature): Fragment["evidences"] {
    const evidence: Evidence = {
        title: "Imported information",
        source: {
            name: "Imported from IEDB",
            links: [
                {
                    name: feature.evidence.toString(),
                    url: `http://www.iedb.org/epitope/${feature.evidence}`,
                },
            ],
        },
    };
    return [evidence];
}
