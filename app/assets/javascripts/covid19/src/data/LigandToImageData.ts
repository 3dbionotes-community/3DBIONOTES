import {
    array,
    Codec,
    exactly,
    GetType,
    nullType,
    number,
    oneOf,
    optional,
    string,
    unknown,
} from "purify-ts";

const wellC = Codec.interface({
    dbId: string,
    name: string,
    externalLink: string,
    imagesIds: string,
    imageThumbailLink: string,
    cellLine: string,
    cellLineTermAccession: string,
    controlType: string,
    qualityControl: string,
    micromolarConcentration: oneOf([number, nullType]),
    percentageInhibition: number,
    hitOver75Activity: string,
    numberCells: number,
    phenotypeAnnotationLevel: string,
    channels: string,
});

const plateC = Codec.interface({
    dbId: string,
    name: string,
    wells: array(wellC),
    controlWells: array(wellC),
});

const screenC = Codec.interface({
    dbId: string,
    name: string,
    type: string,
    typeTermAccession: string,
    technologyType: string,
    technologyTypeTermAccession: string,
    imagingMethod: string,
    imagingMethodTermAccession: string,
    sampleType: string,
    dataDoi: string,
    plateCount: nullType,
    plates: array(plateC),
});

const authorC = Codec.interface({
    name: string,
    email: string,
    address: string,
    orcid: string,
    role: string,
});

const publicationC = Codec.interface({
    title: string,
    journal_abbrev: string,
    issn: string,
    issue: string,
    volume: string,
    page_first: string,
    page_last: string,
    year: string,
    doi: string,
    pubMedId: string,
    PMCId: string,
    abstract: string,
    authors: array(authorC),
});

const organismC = Codec.interface({
    ncbi_taxonomy_id: string,
    scientific_name: string,
    common_name: string,
    externalLink: string,
});

const assayC = Codec.interface({
    dbId: string,
    name: string,
    description: string,
    assayType: string,
    assayTypeTermAccession: string,
    organisms: array(organismC),
    externalLink: string,
    releaseDate: string,
    dataDoi: string,
    publications: array(publicationC),
    BIAId: string,
    screenCount: number,
    screens: array(screenC),
    additionalAnalyses: array(unknown), //...
});

const imageDataC = Codec.interface({
    name: string,
    description: string,
    externalLink: string,
    dataSource: string,
    assays: array(assayC),
});

export const ligandToImageDataC = Codec.interface({
    detail: optional(exactly("Not found.")),
    IUPACInChIkey: string,
    name: string,
    formula: string,
    formula_weight: number,
    dbId: string,
    pubChemCompoundId: string,
    imageLink: string,
    externalLink: string,
    imageData: array(imageDataC), //it shouldn't be an array...
});

export type LigandToImageData = GetType<typeof ligandToImageDataC>;
