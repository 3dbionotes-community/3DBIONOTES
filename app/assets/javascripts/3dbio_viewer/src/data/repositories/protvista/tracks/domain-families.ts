import _ from "lodash";
import { subtracks } from "../../../../domain/definitions/subtracks";
import { Evidence } from "../../../../domain/entities/Evidence";
import { Fragments, getFragments } from "../../../../domain/entities/Fragment2";
import i18n from "../../../../domain/utils/i18n";

/*
Domain family: Pfam, smart, interpro?

Pfam: http://3dbionotes.cnb.csic.es/api/annotations/Pfam/Uniprot/P0DTC2
SMART: http://3dbionotes.cnb.csic.es/api/annotations/SMART/Uniprot/P0DTC2
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

export type SmartAnnotations = SmartAnnotation[];

export interface SmartAnnotation {
    domain: string;
    start: string;
    end: string;
    evalue: string;
    type: string;
    status: string;
}

export function getDomainFamiliesFragments(
    annotations: Partial<{
        pfam: PfamAnnotations;
        smart: SmartAnnotations;
    }>,
    protein: string
): Fragments {
    const pfamEvidences = getPfamEvidences(protein);
    const smartEvidences = getSmartEvidences(protein);

    const pfamFragments = getFragments(annotations.pfam, annotation => {
        return {
            subtrack: subtracks.pfamDomain,
            start: annotation.start,
            end: annotation.end,
            description: getPfamDescription(annotation),
            evidences: pfamEvidences,
        };
    });

    const smartFragments = getFragments(annotations.smart, annotation => {
        return {
            subtrack: subtracks.smartDomains,
            start: annotation.start,
            end: annotation.end,
            description: getSmartDescription(annotation),
            evidences: smartEvidences,
        };
    });

    return _.concat(pfamFragments, smartFragments);
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
        source: {
            name: i18n.t("Imported from Pfam"),
            links: [{ name: protein, url: `http://pfam.xfam.org/protein/${protein}` }],
        },
    };

    return [evidence];
}

function getSmartDescription(annotation: SmartAnnotation): string {
    const items: Item[] = [
        { name: undefined, values: [_.startCase(annotation.domain)] },
        { name: i18n.t("Type"), values: [annotation.type] },
    ];

    return getStringFromItems(items);
}

function getSmartEvidences(protein: string): Evidence[] {
    const evidence: Evidence = {
        title: i18n.t("Imported information"),
        source: {
            name: i18n.t("Imported from SMART"),
            links: [
                {
                    name: protein,
                    url: `http://smart.embl.de/smart/batch.pl?INCLUDE_SIGNALP=1&IDS=${protein}`,
                },
            ],
        },
    };

    return [evidence];
}

interface Item {
    name: string | undefined;
    values: Array<string | undefined> | undefined;
}

function getStringFromItems(items: Item[]): string {
    return _(items)
        .map(item =>
            item.values && !_.isEmpty(item.values)
                ? _.compact([
                      item.name ? `<b style="color: grey">${item.name}:</b>` : undefined,
                      item.name ? item.values.join(", ") : `<b>${item.values.join(", ")}</b>`,
                  ]).join(" ")
                : null
        )
        .compact()
        .join("<br/>");
}
