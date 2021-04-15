import _ from "lodash";
import { Evidence } from "../../../../domain/entities/Evidence";
import { FragmentResult, Fragments, getFragments } from "../../../../domain/entities/Fragment2";
import i18n from "../../../../webapp/utils/i18n";
import { subtracks } from "../definitions";

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

export function getProteomicsFragments(proteomics: Proteomics): Fragments {
    const [uniqueFeatures, _nonUniqueFeatures] = _.partition(
        proteomics.features,
        feature => feature.unique
    );

    return getFragments(
        uniqueFeatures,
        (feature): FragmentResult => {
            return {
                subtrack: subtracks.uniquePeptide,
                start: feature.begin,
                end: feature.end,
                evidences: getEvidences(feature),
            };
        }
    );
}

function getEvidences(_feature: ProteomicsFeature): Evidence[] {
    /*
    ...feature.evidences.map(({ source }) => `${source.name} - ${source.id} - ${source.url}`),
    ...feature.xrefs.map(xref => `${xref.id} - ${xref.name} - ${xref.url}`),
    */

    const evidence: Evidence = {
        title: i18n.t(
            "Combined sources (Automatic assertion inferred from combination of experimental and computational evidence)"
        ),
        sources: [
            { name: "source", links: [{ name: "Name", url: "http://1" }] },
            { name: "source", links: [{ name: "Name", url: "http://1" }] },
        ],
    };

    return [evidence, evidence];
}
