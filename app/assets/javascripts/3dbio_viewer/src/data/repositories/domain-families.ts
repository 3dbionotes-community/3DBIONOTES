import _ from "lodash";
import { getFragment } from "../../domain/entities/Fragment";
import { Track } from "../../domain/entities/Track";
import { config } from "./protvista-config";

// Domain family: Pfam, smart, interpro

export type PfamAnnotations = PfamAnnotation[];

export interface PfamAnnotation {
    start: string;
    end: string;
    acc: string;
    id: string;
    info: {
        description: string;
        go: Partial<{
            component: string[];
            function: string[];
            process: string[];
        }>;
    };
}

export function getDomainFamiliesTrack(pfamAnnotations: PfamAnnotations): Track {
    const itemKey = "pfam_domain";

    return {
        id: "domain-families",
        label: "Domain families",
        subtracks: [
            {
                accession: "Pfam domain",
                type: "Pfam domain",
                label: "Pfam domain",
                labelTooltip: config.tracks.pfam_domain.tooltip,
                shape: config.shapeByTrackName[itemKey] || "circle",
                locations: [
                    {
                        fragments: _.flatMap(pfamAnnotations, item =>
                            getFragment({
                                start: item.start,
                                end: item.end,
                                description: "Imported from Pfam",
                                color: config.colorByTrackName[itemKey],
                            })
                        ),
                    },
                ],
            },
        ],
    };
}
