import _ from "lodash";
import { Evidence } from "../../../../domain/entities/Evidence";
import { FragmentResult, Fragments, getFragments } from "../../../../domain/entities/Fragment2";
import i18n from "../../../../webapp/utils/i18n";
import { subtracks } from "../definitions";

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
    mobiUniprot: MobiUniprot | undefined,
    protein: string
): Fragments {
    if (!mobiUniprot) return [];
    const evidences = getEvidences(protein);

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

function getEvidences(protein: string): Evidence[] {
    const evidence: Evidence = {
        title: i18n.t("Imported information"),
        sources: [
            {
                name: i18n.t("Imported from MobyDB"),
                links: [
                    {
                        name: protein,
                        url: `https://mobidb.bio.unipd.it/entries/${protein}`,
                    },
                ],
            },
        ],
    };

    return [evidence];
}
