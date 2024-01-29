import i18n from "../../utils/i18n";
import { GetValue, Maybe } from "../../../utils/ts-utils";
import { ProteinId } from "../../../domain/entities/Protein";
import { Pdb } from "../../../domain/entities/Pdb";

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

/* Global variables used by PPI. Check app/assets/javascripts/ppi_frame/graph_class.js */
declare global {
    interface Window {
        global_infoAlignment: InfoAlignment;
        network_flag: boolean;
        uploaded_annotations: { result: string }; // JSON containing the annotations
    }
}

export interface PPIIframeContentWindow {
    cytoscape_graph: {
        load_features(featureKey: FeatureKey): void;
    };
}

/* Alignment is set a global variable window.global_infoAlignment since it's used this way
   in viewers. PPI viewer uses it in these files:

    app/assets/javascripts/ppi_frame/graph_class.js
    app/assets/javascripts/ppi_frame/ppi_lib.js

    Here we define only the properties required by PPI.
*/

export type InfoAlignment = InfoAlignmentFromPdb | InfoAlignmentFromNetwork;

export interface InfoAlignmentFromPdb {
    origin: "PDB";
    pdb: string;
    chain: string;
}

export interface InfoAlignmentFromNetwork {
    origin: "interactome3d";
    acc: ProteinId; // "P01116"
    file: string; // "P01116-EXP-4obe_A.pdb"
    path: string; // "interactome3d:P01116-EXP-4obe_A__pdb"
    pdb: string; //  "P01116-EXP-4obe_A.pdb"
    chain: string; // "A"
}

export function getInfoAlignmentFromPdb(pdb: Pdb): Maybe<InfoAlignment> {
    if (!pdb.protein) return undefined;
    if (pdb.proteinNetwork) {
        return {
            origin: "interactome3d",
            acc: pdb.protein.id,
            file: pdb.file || "",
            path: pdb.path || "",
            pdb: pdb.file || "",
            chain: pdb.chainId,
        };
    } else if (pdb.id) {
        return {
            origin: "PDB",
            pdb: pdb.id,
            chain: pdb.chainId,
        };
    } else {
        return undefined;
    }
}
