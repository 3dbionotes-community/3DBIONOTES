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
    tooltipContent: string; // "\n        <table>\n            <tr>\n                <td>Variant</td>\n                <td>L > V</td>\n            </tr>\n            \n            \n        <tr>\n            <td>SIFT</td>\n            <td>0.215</td>\n        </tr>\n        \n            \n        <tr>\n            <td>Polyphen</td>\n            <td>0.003</td>\n        </tr>\n        \n            \n            \n        <tr>\n            <td>Consequence</td>\n            <td>missense</td>\n        </tr>\n        \n            \n            \n            \n            <tr>\n                <td>Location</td>\n                <td>NC_000021.9:g.26170608A>C</td>\n            </tr>\n            \n            \n            \n        </table>\n    ";
    variant: string; // "V";
    xrefNames: string[]; // ["gnomAD", "TOPMed"];
    keywords?: string[]; // ["large_scale_studies", "predicted"];
}

export interface VariantFilter {
    name: string;
    type: { name: "consequence" | "provenance"; text: string };
    options: { labels: string[]; colors: string[] };
}
