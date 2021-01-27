import { Color } from "./Color";

export interface Variants {
    sequence: string;
    variants: Variant[];
    filters: VariantFilter[];
}

export interface Variant {
    accession: string; // "NC_000021.9:g.26170608A>C";
    association?: [];
    clinicalSignificances?: null;
    color: Color;
    start: string;
    end: string;
    polyphenScore?: number;
    siftScore?: number;
    sourceType: string; //"large_scale_study";
    description: string;
    variant: string; // "V";
    xrefNames: string[]; // ["gnomAD", "TOPMed"];
    keywords?: string[]; // ["large_scale_studies", "predicted"];
}

export interface VariantFilter {
    name: string;
    type: { name: "consequence" | "provenance"; text: string };
    options: { labels: string[]; colors: string[] };
}
