import { FragmentResult, Fragments, getFragments } from "../../../../domain/entities/Fragment2";
import { subtracks } from "../definitions";
import { getEvidencesFromApiEvidence } from "../entities/ApiEvidenceSource";

export interface AntigenicResponse {
    accession: string;
    entryName: string;
    sequence: string;
    sequenceChecksum: string;
    taxid: number;
    features: AntigenicFeature[];
}

export interface AntigenicFeature {
    type: "ANTIGEN";
    begin: string;
    end: string;
    xrefs: Array<{
        name: string;
        id: string;
        url: string;
        properties?: {
            "gene ID": string;
            "protein sequence ID": string;
        };
    }>;
    evidences: [
        {
            code: string;
            source?: { name: string; id: string; url: string };
        }
    ];
    antigenSequence: string;
    matchScore: number;
}

export function getAntigenicFragments(response: AntigenicResponse, protein: string): Fragments {
    return getFragments(
        response.features,
        (feature): FragmentResult => {
            return {
                subtrack: subtracks.abBindingSequence,
                start: feature.begin,
                end: feature.end,
                evidences: getEvidencesFromApiEvidence(feature.evidences, protein),
                crossReferences: feature.xrefs.map(xref => ({ name: xref.id, links: [xref] })),
                alignmentScore: feature.matchScore,
            };
        }
    );
}
