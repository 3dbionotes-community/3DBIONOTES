import { Link } from "./Link";

export interface Evidence {
    title: string;
    source?: EvidenceSource;
    alternativeSource?: EvidenceSource;
}

export interface EvidenceSource {
    name: string;
    links: Link[];
}
