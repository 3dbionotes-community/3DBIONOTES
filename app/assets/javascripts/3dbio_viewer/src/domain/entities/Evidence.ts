import { Link } from "./Link";

export interface Evidence {
    title: string;
    sources: EvidenceSource[];
}

export interface EvidenceSource {
    name: string;
    links: Link[];
}

export function joinEvidences(evidences: Evidence[]): Evidence[] {
    // TODO: Join repeated evidences (special case: "N publication(s) (INFO)")
    return evidences;
}
