import _ from "lodash";
import { getEvidencesFrom } from "../../../../domain/entities/Evidence";
import { FragmentResult, Fragments, getFragments } from "../../../../domain/entities/Fragment2";
import i18n from "../../../../webapp/utils/i18n";
import { subtracks } from "../definitions";

// Example: http://3dbionotes.cnb.csic.es/api/annotations/IEDB/Uniprot/O14920

export interface MobiUniprot {
    disorder: MobiUniprotItem;
    lips: MobiUniprotItem;
}

export type MobiUniprotItem = Partial<Record<"inferred" | "database", MobiAnnotation[]>>;

interface MobiAnnotation {
    start: number;
    end: number;
    method: string | null;
}

export function getMobiUniprotFragments(
    mobiUniprot: MobiUniprot,
    protein: string
): Fragments {
    const evidences = getEvidencesFrom("MobyDB", {
        name: protein,
        url: `https://mobidb.bio.unipd.it/entries/${protein}`,
    });

    const lipsFragments = getFragments(
        mobiUniprot.lips.inferred,
        (annotation): FragmentResult => {
            return {
                subtrack: subtracks.linearInteractingPeptide,
                start: annotation.start,
                end: annotation.end,
                description: i18n.t("Interacting peptide region"),
                evidences,
            };
        }
    );

    const disorderFragments = getFragments(
        mobiUniprot.disorder.inferred,
        (annotation): FragmentResult => {
            const method = annotation.method || "Unknown";
            const inferredFrom = i18n.t("Inferred from") + " " + method;

            return {
                subtrack: subtracks.prediction,
                start: annotation.start,
                end: annotation.end,
                description: i18n.t("Disordered region") + " - " + inferredFrom,
                evidences,
            };
        }
    );

    return _.concat(lipsFragments, disorderFragments);
}
