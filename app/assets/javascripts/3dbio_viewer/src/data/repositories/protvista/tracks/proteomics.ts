import _ from "lodash";
import { FragmentResult, Fragments, getFragments } from "../../../../domain/entities/Fragment2";
import { SubtrackDefinition } from "../../../../domain/entities/TrackDefinition";
import { subtracks } from "../definitions";
import { getEvidencesFromApiEvidence } from "../entities/ApiEvidenceSource";

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

export function getProteomicsFragments(proteomics: Proteomics, protein: string): Fragments {
    const [uniqueFeatures, nonUniqueFeatures] = _.partition(
        proteomics.features,
        feature => feature.unique
    );

    return _.concat(
        getFragmentsFor(uniqueFeatures, subtracks.uniquePeptide, protein),
        getFragmentsFor(nonUniqueFeatures, subtracks.nonUniquePeptide, protein)
    );
}

function getFragmentsFor(
    features: ProteomicsFeature[],
    subtrack: SubtrackDefinition,
    protein: string
) {
    return getFragments(
        features,
        (feature): FragmentResult => {
            return {
                subtrack,
                start: feature.begin,
                end: feature.end,
                evidences: getEvidencesFromApiEvidence(feature.evidences, protein),
                crossReferences: feature.xrefs.map(xref => ({ name: xref.id, links: [xref] })),
            };
        }
    );
}
