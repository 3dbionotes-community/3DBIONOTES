import _ from "lodash";
import { getFragment } from "../../../domain/entities/Fragment";
import { Track } from "../../../domain/entities/Track";
import { getIf } from "../../../utils/misc";
import { config } from "./config";

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

export type SmartAnnotations = SmartAnnotation[];

export interface SmartAnnotation {
    domain: string;
    start: string;
    end: string;
    evalue: string;
    type: string;
    status: string;
}

export function getDomainFamiliesTrack(
    pfamAnnotations: PfamAnnotations | undefined,
    smartAnnotations: SmartAnnotations | undefined
): Track {
    return {
        id: "domain-families",
        label: "Domain families",
        subtracks: _.compact([
            getIf(pfamAnnotations, pfamAnnotations => ({
                accession: "pfam-domain",
                type: "Pfam domain",
                label: "Pfam domain",
                labelTooltip: config.tracks.pfam_domain.tooltip,
                shape: config.shapeByTrackName.pfam_domain,
                locations: [
                    {
                        fragments: _.flatMap(pfamAnnotations, an =>
                            getFragment({
                                start: an.start,
                                end: an.end,
                                description: "Imported from Pfam",
                                color: config.colorByTrackName.pfam_domain,
                            })
                        ),
                    },
                ],
            })),
            getIf(smartAnnotations, smartAnnotations => ({
                accession: "smart-domain",
                type: "SMART domain",
                label: "SMART domain",
                labelTooltip: config.tracks.pfam_domain.tooltip,
                shape: config.shapeByTrackName.smart_domain,
                locations: [
                    {
                        fragments: _.flatMap(smartAnnotations, an =>
                            getFragment({
                                start: an.start,
                                end: an.end,
                                description: "Imported from SMART",
                                color: config.colorByTrackName.smart_domain,
                            })
                        ),
                    },
                ],
            })),
        ]),
    };
}
