import _ from "lodash";
import { subtracks } from "../../../../domain/definitions/subtracks";
import { Evidence } from "../../../../domain/entities/Evidence";
import { Fragments, getFragments } from "../../../../domain/entities/Fragment2";
import i18n from "../../../../domain/utils/i18n";
import { Maybe } from "../../../../utils/ts-utils";

/*
Example: http://3dbionotes.cnb.csic.es/api/annotations/interpro/Uniprot/O00206
*/

export type InterproAnnotations = InteporoAnnotation[];

export interface InteporoAnnotation {
    id: string;
    start: string;
    end: string;
    description?: { name?: string };
}

export function getInterproDomainFragments(
    annotations: Maybe<InterproAnnotations>,
    protein: string
): Fragments {
    const evidences = getEvidences(protein);

    return getFragments(annotations, annotation => {
        return {
            subtrack: subtracks.interproDomains,
            start: annotation.start,
            end: annotation.end,
            description: annotation.description?.name,
            evidences: evidences,
        };
    });
}

function getEvidences(protein: string): Evidence[] {
    const evidence: Evidence = {
        title: i18n.t("Imported information"),
        source: {
            name: i18n.t("Imported from InterPro"),
            links: [
                {
                    name: protein,
                    url: `https://www.ebi.ac.uk/interpro/protein/UniProt/${protein}`,
                },
            ],
        },
    };

    return [evidence];
}
