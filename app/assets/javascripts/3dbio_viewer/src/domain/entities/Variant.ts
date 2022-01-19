import i18n from "../../webapp/utils/i18n";
import { Color } from "./Color";
import { InfoItem } from "./InfoItem";

export interface Variants {
    sequence?: string;
    variants: Variant[];
    filters: VariantFilter[];
}

export interface Variant {
    accession: string;
    color: Color;
    association: AssociationItem[];
    start: string;
    end: string;
    alternativeSequence: string;
    variant: string;
    wildType: string;
    keywords: Keyword[]; // Used in filter
    info: InfoItem[]; // used to show info in tooltip
}

export type AssociationItem = { disease: boolean };

export type Keyword = KeywordSource | KeywordConsequence;

export type KeywordConsequence = "disease" | "predicted" | "nonDisease" | "other";

export type KeywordSource = "uniprot" | "large_scale_studies" | "cncb";

export interface VariantFilter {
    name: string;
    type: { name: "consequence" | "provenance"; text: string };
    options: { labels: string[]; colors: string[] };
}

export function getTranslations() {
    return {
        sourceType: {
            large_scale_studies: i18n.t("Large scale studies"),
            uniprot: i18n.t("UniProt"),
            mixed: i18n.t("Mixed"),
        } as Record<string, string>,
    };
}

export type VariantFilterType = "consequence" | "source";

export type VariantFilterConfig = {
    name: Keyword;
    type: VariantFilterType;
    items: Array<{ label: string; color: string }>;
};

// See myProtVista/src/VariantFilterDialog.js
export const variantsFiltersConfig: VariantFilterConfig[] = [
    {
        name: "disease",
        type: "consequence",
        items: [{ label: "Disease (reviewed)", color: "#990000" }],
    },
    // defaultFilterCasePrediction (uses externalData -> sift/polyphen predictions)
    /* Disable for now, as we have no identified predicted variants */
    /*
    {
        name: "predicted",
        type: "consequence",
        items: [
            { label: "Predicted deleterious", color: "#002594" },
            { label: "Predicted benign", color: "#8FE3FF" },
        ],
    },
    */
    {
        name: "nonDisease",
        type: "consequence",
        items: [{ label: "Non-disease (reviewed)", color: "#99cc00" }],
    },
    {
        name: "other",
        type: "consequence",
        items: [{ label: "Init, stop loss or gain", color: "#FFCC00" }],
    },

    {
        name: "uniprot",
        type: "source",
        items: [{ label: "UniProt reviewed", color: "#808080" }],
    },
    {
        name: "large_scale_studies",
        type: "source",
        items: [{ label: "Large scale studies", color: "#808080" }],
    },
    {
        name: "cncb",
        type: "source",
        items: [{ label: "CNCB", color: "#808080" }],
    },
];

export const urls = {
    diseases: (name: string) =>
        `https://www.uniprot.org/diseases/?query=${encodeURIComponent(name)}`,
    hive: (proteinId: string) =>
        `https://hive.biochemistry.gwu.edu/biomuta/proteinview/${proteinId}`,
    ncbi: (ref: string) => `http://www.ncbi.nlm.nih.gov/pubmed/${ref}`,
};

export function getVariantFilters(): VariantFilter[] {
    return variantsFiltersConfig.map(
        (filter): VariantFilter => ({
            name: filter.name,
            type: {
                name: filter.type === "source" ? ("provenance" as const) : ("consequence" as const),
                text: textByVariantFilterType[filter.type],
            },
            options: {
                labels: filter.items.map(item => item.label),
                colors: filter.items.map(item => item.color),
            },
        })
    );
}

const textByVariantFilterType: Record<VariantFilterType, string> = {
    consequence: "Filter consequence",
    source: "Filter data source",
};
