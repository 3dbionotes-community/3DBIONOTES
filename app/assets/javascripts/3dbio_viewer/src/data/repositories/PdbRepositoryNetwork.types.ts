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

export interface Features {
    accession: string;
    entryName: string;
    sequence: string;
    sequenceChecksum: string;
    taxid: number;
    features: Feature[];
}

export interface Feature {
    type: string;
    category: string;
    description: string;
    begin: string;
    end: string;
    molecule: string;
    evidences: Array<{
        code: string;
        source: { name: string; id: string; url: string; alternativeUrl?: string };
    }>;
}

export interface GroupedFeature {
    name: string;
    items: {
        name: string;
        items: Feature[];
    }[];
}

export type Cv19Annotations = Cv19Annotation[];

export interface Cv19Annotation {
    track_name: string;
    visualization_type?: "variants"; // This type uses a different Data, implement if necessary
    acc: string;
    data: Cv19AnnotationData[];
    reference: string;
    fav_icon: string;
}

export interface Cv19AnnotationData {
    begin: number;
    end: number;
    partner_name: string;
    color: string;
    description: string;
    type: string;
}

export type PdbAnnotations = PdbAnnotation[];

export interface PdbAnnotation {
    chain: string;
    minVal: number;
    maxVal: number;
    algorithm: string;
    algoType: string;
    data: Array<{ begin: string; value: number }>;
}

export interface Coverage {
    "Structure coverage": Array<{
        start: number;
        end: number;
    }>;
}
