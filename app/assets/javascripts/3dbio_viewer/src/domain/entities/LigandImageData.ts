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
    type: string;
    typeTermAccession: string;
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
    description?: string;
    type: string;
    typeTermAccession: string;
    technologyType: string;
    technologyTypeTermAccession: string;
    imagingMethod: string;
    imagingMethodTermAccession: string;
    doi: Url;
    well?: Url;
    plates: Plate[];
}

export interface Compound {
    percentageInhibition?: string;
    cytotoxicity?: string;
    doseResponse?: string;
    cytotoxicIndex?: string;
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
}

type Url = string;
type DataDoi = string;
