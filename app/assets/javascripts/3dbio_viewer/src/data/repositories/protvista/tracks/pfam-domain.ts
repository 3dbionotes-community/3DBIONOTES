import _ from "lodash";
import { subtracks } from "../../../../domain/definitions/subtracks";
import { Evidence } from "../../../../domain/entities/Evidence";
import { Fragments, getFragments } from "../../../../domain/entities/Fragment2";
import i18n from "../../../../domain/utils/i18n";
import { Maybe } from "../../../../utils/ts-utils";
import { getStringFromItems, Item } from "../utils";

/*
Example: http://3dbionotes.cnb.csic.es/api/annotations/Pfam/Uniprot/P0DTC2
*/

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
    pfamAnnotations: Maybe<PfamAnnotations>,
    protein: string
): Fragments {
    const pfamEvidences = getPfamEvidences(protein);

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

function getPfamEvidences(protein: string): Evidence[] {
    const evidence: Evidence = {
        title: i18n.t("Imported information"),
        sources: [
            {
                name: i18n.t("Imported from Pfam"),
                links: [{ name: protein, url: `http://pfam.xfam.org/protein/${protein}` }],
            },
        ],
    };

    return [evidence];
}
