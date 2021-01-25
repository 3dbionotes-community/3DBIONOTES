import { Variant, VariantFilter, Variants } from "../../../../domain/entities/Variant";

export interface EbiVariation {
    accession: string; // "P0DTC2";
    entryName: string; // "SPIKE_SARS2";
    proteinName: string; //"Spike glycoprotein";
    geneName: string; // "S";
    organismName: string; // "Severe acute respiratory syndrome coronavirus 2";
    proteinExistence: string; //"Evidence at protein level";
    sequence: string; //"MFVFL";
    sequenceChecksum: string; //"12789069390587161140";
    sequenceVersion: number; // 1
    taxid: number; // 2697049;
    features: EbiVariationFeature[];
}

export interface EbiVariationFeature {
    type: "VARIANT";
    alternativeSequence: string; //"L",
    begin: string; //"2",
    end: string; // "2",
    xrefs?: Array<{
        name: string; // "ENA",
        id: string; // "MN908947.3:21568:T:A"
    }>;
    genomicLocation: string; //"NC_045512.2:g.21568T>A";
    locations: Array<{
        loc: string; // "p.Phe2Leu";
        seqId: string; // "ENSSAST00005000004";
        source: string; // "EnsemblViruses";
    }>;
    codon: string; // "TTT/TTA";
    consequenceType: "missense" | "stop gained";
    wildType: string; //"F";
    mutatedType: string; // "L";
    somaticStatus: number; // 0;
    sourceType: string; // "large_scale_study";
}

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
            association: _variant => {
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
