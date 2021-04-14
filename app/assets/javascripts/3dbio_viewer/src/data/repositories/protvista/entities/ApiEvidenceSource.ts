import _ from "lodash";
import { Evidence, EvidenceSource } from "../../../../domain/entities/Evidence";
import { getEvidenceText } from "../tracks/legacy/TooltipFactory";

export interface ApiEvidenceSource {
    name: string;
    id: string;
    url: string;
    alternativeUrl?: string;
}

export interface ApiEvidence {
    code: string;
    source?: ApiEvidenceSource;
}

export function getEvidenceFromSources(options: {
    accession: string;
    code: string;
    sourceEvidences: ApiEvidenceSource[];
}): Evidence {
    const { accession, code, sourceEvidences } = options;
    const mainSourceEvidence = sourceEvidences[0];
    const evidenceText = getEvidenceText({ accession }, code, sourceEvidences);

    if (!mainSourceEvidence) return { title: evidenceText };

    const source: EvidenceSource = {
        name: mainSourceEvidence.name,
        links: sourceEvidences.map(src => ({ name: src.id, url: src.url })),
    };

    const alternativeSourceLinks = _(sourceEvidences)
        .map(src => (src.alternativeUrl ? { name: src.id, url: src.alternativeUrl } : null))
        .compact()
        .value();

    const alternativeSource: EvidenceSource | undefined = _.isEmpty(alternativeSourceLinks)
        ? undefined
        : {
              name: mainSourceEvidence.name === "PubMed" ? "EuropePMC" : source.name,
              links: alternativeSourceLinks,
          };

    return { title: evidenceText, source: source, alternativeSource };
}

export function getSourceEvidencesFromReferences(references: string): ApiEvidenceSource[] {
    return _(references.split(/[^\w]+/))
        .uniq()
        .map(
            (reference): ApiEvidenceSource => ({
                id: reference,
                name: "PubMed",
                url: "http://www.ncbi.nlm.nih.gov/pubmed/" + reference,
                alternativeUrl: "http://europepmc.org/abstract/MED/" + reference,
            })
        )
        .value();
}

export function getEvidenceFromReferences(options: {
    accession: string;
    code: string;
    references: string;
}): Evidence {
    const { accession, code, references } = options;
    const sourceEvidences = getSourceEvidencesFromReferences(references);
    return getEvidenceFromSources({ accession, code, sourceEvidences });
}
