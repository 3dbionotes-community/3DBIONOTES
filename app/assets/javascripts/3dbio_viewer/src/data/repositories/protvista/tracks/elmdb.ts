import _ from "lodash";

import { Evidence } from "../../../../domain/entities/Evidence";
import { FragmentResult, Fragments, getFragments } from "../../../../domain/entities/Fragment2";
import i18n from "../../../../domain/utils/i18n";
import { subtracks } from "../definitions";
import { bold, lineBreak } from "../utils";
import { getEvidenceFromSources, ApiEvidenceSource } from "../entities/ApiEvidenceSource";

// http://3dbionotes.cnb.csic.es/api/annotations/elmdb/Uniprot/O00206

export type ElmdbUniprot = ElmdbUniprotAnnotation[];

interface ElmdbUniprotAnnotation {
    End: string;
    Methods: string;
    Primary_Acc: string;
    ELMType: string;
    Accession: string;
    interactions: Interaction[];
    PDB: string;
    Start: string;
    References: string;
    Accessions: string[];
    ProteinName: string;
    ELMIdentifier: string;
    Organism: string;
    InstanceLogic: string;
    description: Array<{
        Regex: string;
        Description: string;
        Probability: string;
        Accession: string;
        FunctionalSiteName: string;
        ELMIdentifier: string;
        "#Instances_in_PDB": string;
        "#Instances": string;
    }>;
}

export interface Interaction {
    Domain: string;
    AffinityMin: string;
    StopDomain: string;
    Elm: string;
    interactorElm: string;
    taxonomyDomain: string;
    AffinityMax: string;
    StartElm: string;
    StartDomain: string;
    interactorDomain: string;
    PMID: string;
    StopElm: string;
    taxonomyElm: string;
}

export function getElmdbUniprotFragments(elmdbUniprot: ElmdbUniprot, _protein: string): Fragments {
    return getFragments(
        elmdbUniprot,
        (annotation): FragmentResult => {
            return {
                subtrack: subtracks.motifs,
                start: annotation.Start,
                end: annotation.End,
                description: getDescription(annotation),
                evidences: getEvidences(annotation),
            };
        }
    );
}

function getDescription(annotation: ElmdbUniprotAnnotation): string {
    const apiDescription = annotation.description[0];
    const mainDescription =
        i18n.t("Short linear motif") + (apiDescription ? ` (${apiDescription.Regex})` : "");

    const interactionDescriptions = annotation.interactions.map(interaction => {
        const hasInterval = interaction.StartDomain !== "None" && interaction.StopDomain !== "None";
        const parts = [
            bold(i18n.t("Interactor:")),
            interaction.interactorDomain,
            bold(i18n.t("Domain:")),
            interaction.Domain,
            ...(hasInterval
                ? [
                      bold(i18n.t("Start:")),
                      interaction.StartDomain,
                      bold(i18n.t("End:")),
                      interaction.StopDomain,
                  ]
                : []),
        ];
        return parts.join(" ");
    });

    return [mainDescription, ...interactionDescriptions].join(lineBreak);
}

function getEvidences(annotation: ElmdbUniprotAnnotation): Evidence[] {
    const elmId = annotation.ELMIdentifier;

    const evidence: Evidence = {
        title: i18n.t("Imported information"),
        source: {
            name: i18n.t("Imported from ELM"),
            links: [
                {
                    name: elmId,
                    url: `http://elm.eu.org/elms/MOD_N-GLC_1/${elmId}`,
                },
            ],
        },
    };

    const sourceEvidences = annotation.References.split(" ").map(
        (reference): ApiEvidenceSource => ({
            id: reference,
            name: "PubMed",
            url: "http://www.ncbi.nlm.nih.gov/pubmed/" + reference,
            alternativeUrl: "http://europepmc.org/abstract/MED/" + reference,
        })
    );

    const evidenceFromReferences = getEvidenceFromSources({
        accession: elmId,
        code: "ECO:0000269",
        sourceEvidences,
    });

    return _.compact([evidence, evidenceFromReferences]);
}
