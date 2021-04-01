import _ from "lodash";
import { Evidence, EvidenceSource } from "../../../../domain/entities/Evidence";
import { getEvidenceText } from "../tracks/legacy/TooltipFactory";

export interface ApiEvidenceSource {
    name: string;
    id: string;
    url: string;
    alternativeUrl?: string;
}

export function getEvidenceFromSources(options: {
    accession: string;
    code: string;
    sourceEvidences: ApiEvidenceSource[];
}): Evidence | undefined {
    const { accession, code, sourceEvidences } = options;
    const mainSourceEvidence = sourceEvidences[0];
    if (!mainSourceEvidence) return;

    const evidenceText = getEvidenceText({ accession: accession }, code, sourceEvidences);

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
