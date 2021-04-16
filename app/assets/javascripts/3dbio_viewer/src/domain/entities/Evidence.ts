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
