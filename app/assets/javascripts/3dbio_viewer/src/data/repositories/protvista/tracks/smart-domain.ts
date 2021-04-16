import _ from "lodash";
import { subtracks } from "../../../../domain/definitions/subtracks";
import { getEvidencesFrom } from "../../../../domain/entities/Evidence";
import { Fragments, getFragments } from "../../../../domain/entities/Fragment2";
import i18n from "../../../../domain/utils/i18n";
import { Maybe } from "../../../../utils/ts-utils";
import { getStringFromItems, Item } from "../utils";

// Example: http://3dbionotes.cnb.csic.es/api/annotations/SMART/Uniprot/P0DTC2

export type SmartAnnotations = SmartAnnotation[];

export interface SmartAnnotation {
    domain: string;
    start: string;
    end: string;
    evalue: string;
    type: string;
    status: string;
}

export function getSmartDomainFragments(
    smartAnnotations: Maybe<SmartAnnotations>,
    protein: string
): Fragments {
    const smartEvidences = getEvidencesFrom("Imported from SMART", {
        name: protein,
        url: `http://smart.embl.de/smart/batch.pl?INCLUDE_SIGNALP=1&IDS=${protein}`,
    });

    return getFragments(smartAnnotations, annotation => {
        return {
            subtrack: subtracks.smartDomains,
            start: annotation.start,
            end: annotation.end,
            description: getSmartDescription(annotation),
            evidences: smartEvidences,
        };
    });
}

function getSmartDescription(annotation: SmartAnnotation): string {
    const items: Item[] = [
        { name: undefined, values: [_.startCase(annotation.domain)] },
        { name: i18n.t("Type"), values: [annotation.type] },
    ];

    return getStringFromItems(items);
}
