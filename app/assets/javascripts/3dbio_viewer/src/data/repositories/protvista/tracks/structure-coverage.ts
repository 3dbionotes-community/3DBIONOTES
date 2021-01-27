import _ from "lodash";
import { Track } from "../../../../domain/entities/Track";
import { config } from "../config";

export interface Coverage {
    "Structure coverage": Array<{ start: number; end: number }>;
}

export function getStructureCoverageTrack(coverage: Coverage): Track {
    const itemKey = "region";
    const trackConfig = config.tracks[itemKey];
    const name = "Region";

    return {
        id: "structure-coverage",
        label: "Structure coverage",
        subtracks: [
            {
                accession: name,
                type: name,
                label: name,
                labelTooltip: trackConfig.tooltip,
                shape: config.shapeByTrackName[itemKey] || "circle",
                locations: [
                    {
                        fragments: _.flatMap(coverage["Structure coverage"], item => ({
                            start: item.start,
                            end: item.end,
                            description: "Sequence segment covered by the structure",
                            color: config.colorByTrackName[itemKey],
                        })),
                    },
                ],
            },
        ],
    };
}
