// http://3dbionotes.cnb.csic.es/api/annotations/elmdb/Uniprot/O00206

import { Evidence } from "../../../../domain/entities/Evidence";
import { FragmentResult, Fragments, getFragments } from "../../../../domain/entities/Fragment2";
import i18n from "../../../../domain/utils/i18n";
import { subtracks } from "../definitions";

export type ElmdbUniprot = ElmdbUniprotAnnotation[];

interface ElmdbUniprotAnnotation {
    End: string;
    Methods: string;
    Primary_Acc: string;
    ELMType: string;
    Accession: string;
    interactions: [];
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

export function getElmdbUniprotFragments(elmdbUniprot: ElmdbUniprot, protein: string): Fragments {
    const evidences = getEvidences(protein);

    return getFragments(
        elmdbUniprot,
        (annotation): FragmentResult => {
            const anDescription = annotation.description[0];
            const description =
                i18n.t("Short linear motif") + (anDescription ? ` (${anDescription.Regex})` : "");

            return {
                subtrack: subtracks.motifs,
                start: annotation.Start,
                end: annotation.End,
                description,
                evidences,
            };
        }
    );
}

function getEvidences(protein: string): Evidence[] {
    const evidence: Evidence = {
        title: i18n.t("Imported information"),
        source: {
            name: i18n.t("Imported from TODO"),
            links: [
                {
                    name: protein,
                    url: `https://TODO.bio.unipd.it/entries/${protein}`,
                },
            ],
        },
    };

    return [evidence];
}
