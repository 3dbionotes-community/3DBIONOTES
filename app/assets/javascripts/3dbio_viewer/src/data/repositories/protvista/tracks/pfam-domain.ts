import _ from "lodash";
import { subtracks } from "../../../../domain/definitions/subtracks";
import { getEvidencesFrom } from "../../../../domain/entities/Evidence";
import { Fragments, getFragments } from "../../../../domain/entities/Fragment2";
import i18n from "../../../../domain/utils/i18n";
import { getStringFromItems, Item } from "../utils";

// Example: http://3dbionotes.cnb.csic.es/api/annotations/Pfam/Uniprot/P0DTC2

export type PfamAnnotations = PfamAnnotation[];

export interface PfamAnnotation {
    start: string;
    end: string;
    acc: string;
    id: string;
    info?: {
        description: string;
        go: Partial<{
            component: string[];
            function: string[];
            process: string[];
        }>;
    };
}

export function getPfamDomainFragments(
    pfamAnnotations: PfamAnnotations,
    protein: string
): Fragments {
    const pfamEvidences = getEvidencesFrom("Pfam", {
        name: protein,
        url: `http://pfam.xfam.org/protein/${protein}`,
    });

    return getFragments(pfamAnnotations, annotation => {
        return {
            subtrack: subtracks.pfamDomain,
            start: annotation.start,
            end: annotation.end,
            description: getPfamDescription(annotation),
            evidences: pfamEvidences,
        };
    });
}

function getPfamDescription(annotation: PfamAnnotation): string {
    const go: NonNullable<PfamAnnotation["info"]>["go"] = annotation.info?.go || {};

    const items: Item[] = [
        { name: undefined, values: [annotation.info?.description] },
        { name: i18n.t("Family"), values: [annotation.acc] },
        { name: i18n.t("Component"), values: go.component },
        { name: i18n.t("Function"), values: go.function },
        { name: i18n.t("Process"), values: go.process },
    ];

    return getStringFromItems(items);
}
