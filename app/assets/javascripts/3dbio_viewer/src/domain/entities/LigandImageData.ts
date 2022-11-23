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
    screens: Screen[];
    compound: Compound;
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
    imagingMethod: string;
    imagingMethodTermAccession: string;
    doi: Url;
    well?: Url;
}

export interface Compound {
    percentageInhibition?: string;
    cytotoxicity?: string;
    doseResponse?: string;
    cytotoxicIndex?: string;
}

type Url = string;
type DataDoi = string;
