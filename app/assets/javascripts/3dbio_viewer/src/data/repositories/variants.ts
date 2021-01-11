import { Variant, VariantFilter, Variants } from "../../domain/entities/Variant";
import { EbiVariation } from "./PdbRepositoryNetwork.types";

export type VariantFilterType = "source" | "consequence";

export type VariantFilterConfig = {
    type: VariantFilterType;
    items: Array<{ label: string; color: string }>;
    properties?: {
        association?(variant: unknown): boolean;
    };
};

const variantsFiltersConfig: VariantFilterConfig[] = [
    {
        type: "consequence",
        items: [{ label: "Disease (reviewed)", color: "#990000" }],
        properties: {
            association: variant => {
                // TODO
                /*
                return _.some(variant.association, function (association) {
                    return association.disease === true;
                });
                */
                return true;
            },
        },
    },
    {
        type: "consequence",
        items: [
            { label: "Predicted deleterious", color: "#002594" },
            { label: "Predicted benign", color: "#8FE3FF" },
        ],
    },
    {
        type: "consequence",
        items: [{ label: "Non-disease (reviewed)", color: "#99cc00" }],
    },
    {
        type: "consequence",
        items: [{ label: "Init, stop loss or gain", color: "#FFCC00" }],
    },

    {
        type: "source",
        items: [{ label: "UniProt reviewed", color: "#808080" }],
    },
    {
        type: "source",
        items: [{ label: "Large scale studies", color: "#808080" }],
    },
    {
        type: "source",
        items: [{ label: "CNCB", color: "#808080" }],
    },
];

const textByVariantFilterType: Record<VariantFilterType, string> = {
    consequence: "Filter consequence",
    source: "Filter data source",
};

export function getVariants(ebiVariation: EbiVariation): Variants {
    return {
        sequence: ebiVariation.sequence,
        filters: getVariantFilters(),
        variants: ebiVariation.features.map(
            (v): Variant => ({
                accession: v.genomicLocation,
                color: "#800", // TODO
                start: v.begin,
                end: v.end,
                //polyphenScore: number,
                //siftScore: number,
                sourceType: v.sourceType,
                description: "TODO",
                variant: v.alternativeSequence,
                xrefNames: (v.xrefs || []).map(xref => xref.name),
            })
        ),
    };
}

function getVariantFilters(): VariantFilter[] {
    return variantsFiltersConfig.map(
        (f, idx): VariantFilter => ({
            name: "filter-" + idx,
            type: {
                name: f.type === "source" ? ("provenance" as const) : ("consequence" as const),
                text: textByVariantFilterType[f.type],
            },
            options: {
                labels: f.items.map(item => item.label),
                colors: f.items.map(item => item.color),
            },
        })
    );
}
