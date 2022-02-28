import _ from "lodash";
import { subtracks } from "../../../../domain/definitions/subtracks";
import { getEvidencesFrom } from "../../../../domain/entities/Evidence";
import { Fragments, getFragments } from "../../../../domain/entities/Fragment2";

// Example: http://3dbionotes.cnb.csic.es/api/annotations/interpro/Uniprot/O00206

export type InterproAnnotations = InterproAnnotation[];

export interface InterproAnnotation {
    id: string;
    start: string;
    end: string;
    description?: {
        name?: string;
        go: string[];
    };
}

export function getInterproDomainFragments(
    annotations: InterproAnnotations,
    protein: string
): Fragments {
    const evidences = getEvidencesFrom("InterPro", {
        name: protein,
        url: `https://www.ebi.ac.uk/interpro/protein/UniProt/${protein}`,
    });

    return getFragments(annotations, annotation => {
        return {
            subtrack: subtracks.interproDomains,
            start: annotation.start,
            end: annotation.end,
            description: getDescription(annotation),
            evidences: evidences,
        };
    });
}

function getDescription(annotation: InterproAnnotation): string {
    const name = annotation.description?.name;
    return _.compact([
        name ? `<b>${name}</b>` : null,
        ...(annotation.description?.go || []).map(goString => {
            const [goName = "", goId = ""] = goString.split(" ; ", 2);
            const url = `http://amigo.geneontology.org/amigo/term/${goId}`;
            const goNameClean = _.upperFirst(goName.replace(/^GO:/, ""));
            return goNameClean && url
                ? `<a target="_blank" href="${url}">${goNameClean}</a>`
                : null;
        }),
    ]).join("<br />");
}
