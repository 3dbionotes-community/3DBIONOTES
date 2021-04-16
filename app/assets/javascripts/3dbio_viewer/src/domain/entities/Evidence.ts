import i18n from "../utils/i18n";
import { Link } from "./Link";

export interface Evidence {
    title: string;
    sources: Reference[];
}

export interface Reference {
    name: string;
    links: Link[];
}

export function joinEvidences(evidences: Evidence[]): Evidence[] {
    // TODO: Join repeated evidences (special case: "N publication(s) (INFO)")
    return evidences;
}

export function getEvidencesFrom(dbName: string, link: Link): Evidence[] {
    const evidence: Evidence = {
        title: i18n.t("Imported information"),
        sources: [
            {
                name: i18n.t("Imported from {{dbName}}", { dbName }),
                links: [link],
            },
        ],
    };

    return [evidence];
}
