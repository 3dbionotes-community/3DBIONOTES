import i18n from "../../utils/i18n";
import { GetValue } from "../../../utils/ts-utils";

// See app/assets/javascripts/main_frame/ppi_annotations.js
export const graphFeatures = {
    // GENOMIC VARIANTS & DISEASES
    variants: { text: i18n.t("Display variants"), featureKey: "variants" as const },
    // POST-TRANSLATIONAL MODIFICATIONS
    ptm: { text: i18n.t("Display PTMs"), featureKey: "ptms" as const },
    pfam: { text: i18n.t("Pfam Domains"), featureKey: "pfam" as const },
    interpro: { text: i18n.t("InterPro Domains"), featureKey: "interpro" as const },
    // DISPLAY PROTEIN DOMAINS
    smart: { text: i18n.t("SMART domains"), featureKey: "smart" as const },
    // IMMUNE EPITOPES
    epitopes: { text: i18n.t("Display epitopes"), featureKey: "epitopes" as const },
    // SHORT LINEAR MOTIFS
    linearMotifs: { text: i18n.t("Display linear motifs"), featureKey: "elms" as const },
};

type GraphFeatures = typeof graphFeatures;

export type FeatureId = keyof GraphFeatures;

export type FeatureKey = GetValue<GraphFeatures>["featureKey"];

declare global {
    interface Window {
        global_infoAlignment: InfoAlignment;
    }
}

export interface PPIIframeContentWindow {
    cytoscape_graph: {
        load_features(featureKey: FeatureKey): void;
    };
}

export interface InfoAlignment {
    origin: "PDB";
    pdb: string;
    chain: string;
}
