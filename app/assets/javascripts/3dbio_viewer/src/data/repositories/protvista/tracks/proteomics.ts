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
    unique: true;
}

export function getProteomicsTrack(proteomics: Proteomics): Track {
    return {
        id: "proteomics",
        label: "Proteomics",
        subtracks: [
            {
                accession: "unique-peptide",
                type: "Unique peptide",
                label: "Unique peptide",
                shape: "rectangle",
                locations: [
                    {
                        fragments: _.flatMap(proteomics.features, feature =>
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
