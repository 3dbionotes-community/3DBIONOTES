import { Ontology, OntologyTerm as BioOntologyTerm } from "./Ontology";

export interface LigandImageData {
    name: string;
    description: string;
    externalLink: string;
    dataSource: string;
    assays: Assay[];
}

export interface Assay {
    id: string;
    name: string;
    description: string;
    type: OntologyTerm[];
    dataDoi: DataDoi;
    publications: Publication[];
    organisms: Organism[];
    screens: Screen[];
    compound: Compound;
    bioStudiesAccessionId: string;
}

export interface Publication {
    title: string;
}

export interface Screen {
    id: string;
    name: string;
    description: string;
    type: OntologyTerm[];
    technologyType: OntologyTerm[];
    imagingMethod: OntologyTerm[];
    doi: Url;
    plates: Plate[];
}

export interface Compound {
    name: string;
    percentageInhibition?: string;
    cytotoxicity?: AdditionalAnalysisCompound;
    doseResponse?: AdditionalAnalysisCompound;
    cytotoxicIndex?: AdditionalAnalysisCompound;
}

export interface Organism {
    id: string;
    name: string;
    commonName: string;
    externalLink: Url;
}

export interface Plate {
    id: string;
    name: string;
    wells: Well[];
    controlWells: Well[];
}

export interface Well {
    id: string;
    position: { x: number; y: number };
    image: string;
    cellLine?: OntologyTerm;
    controlType?: string;
    qualityControl: string;
    micromolarConcentration: number | null;
    percentageInhibition: number;
    hitCompound: string;
    numberOfCells: number;
    phenotypeAnnotation: string;
    channels: string;
    externalLink: string;
}

export interface AdditionalAnalysisCompound {
    name: string;
    relation: "<" | ">" | "=";
    value: number;
    description: string;
    units?: OntologyTerm;
    pvalue?: number;
}

type Url = string;
type DataDoi = string;
export type OntologyTerm = Omit<BioOntologyTerm, "source"> & { source?: Ontology };
