import _ from "lodash";
import { getFragment } from "../../../../domain/entities/Fragment";
import { Track } from "../../../../domain/entities/Track";
import i18n from "../../../../webapp/utils/i18n";
import { config } from "../config";

export interface Proteomics {
    accession: string;
    entryName: string;
    sequence: string;
    taxId: string;
    features: ProteomicsFeature[];
}

interface ProteomicsFeature {
    type: string;
    begin: string;
    end: string;
    xrefs: Array<{ name: string; id: string; url: string }>;
    evidences: Array<{ code: string; source: { name: string; id: string; url: string } }>;
    peptide: string;
    unique: boolean;
}

export function getProteomicsTrack(proteomics: Proteomics): Track {
    const uniqueLabel = config.tracks.unique.label;
    const nonUniqueLabel = config.tracks.non_unique.label;

    const [uniqueFeatures, nonUniqueFeatures] = _.partition(
        proteomics.features,
        feature => feature.unique
    );

    return {
        id: "proteomics",
        label: "Proteomics",
        subtracks: [
            {
                accession: "unique-peptide",
                type: uniqueLabel,
                label: uniqueLabel,
                shape: config.shapeByTrackName.unique,
                locations: [
                    {
                        fragments: _.flatMap(uniqueFeatures, feature =>
                            getFragment({
                                start: feature.begin,
                                end: feature.end,
                                description: getDescription(feature),
                                color: config.colorByTrackName.unique,
                            })
                        ),
                    },
                ],
            },
            {
                accession: "non-unique-peptide",
                type: nonUniqueLabel,
                label: nonUniqueLabel,
                shape: config.shapeByTrackName.non_unique,
                locations: [
                    {
                        fragments: _.flatMap(nonUniqueFeatures, feature =>
                            getFragment({
                                start: feature.begin,
                                end: feature.end,
                                description: getDescription(feature),
                                color: config.colorByTrackName.non_unique,
                            })
                        ),
                    },
                ],
            },
        ],
    };
}

function getDescription(feature: ProteomicsFeature): string {
    return [
        i18n.t(
            "Combined sources (Automatic assertion inferred from combination of experimental and computational evidence)"
        ),
        ...feature.evidences.map(({ source }) => `${source.name} - ${source.id} - ${source.url}`),
        ...feature.xrefs.map(xref => `${xref.id} - ${xref.name} - ${xref.url}`),
    ].join("\n");
}
