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
} from "purify-ts";
import { PdbLigand } from "../domain/entities/Pdb";

function maybeNull<Data>(type: Codec<Data>) {
    return oneOf([type, nullType]);
}

const additionalAnalysisC = Codec.interface({
    name: string,
    value: number,
    description: string,
    units: maybeNull(string),
    unitsTermAccession: maybeNull(string),
    pvalue: maybeNull(number),
    dataComment: maybeNull(string),
});

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
    micromolarConcentration: maybeNull(number),
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
    description: optional(string),
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
    additionalAnalyses: array(additionalAnalysisC), //review if api changes the sctructure (codec was extracted from old json)
});

const imageDataC = Codec.interface({
    name: string,
    description: string,
    externalLink: string,
    dataSource: string,
    assays: array(assayC),
});

const notFoundC = Codec.interface({
    detail: exactly("Not found."),
});

export const ligandToImageDataC = Codec.interface({
    IUPACInChIkey: string,
    name: string,
    formula: string,
    formula_weight: number,
    dbId: string,
    pubChemCompoundId: string,
    imageLink: string,
    externalLink: string,
    imageData: optional(array(imageDataC)), //it shouldn't be an array...
});

export const ligandToImageDataResponseC = oneOf([notFoundC, ligandToImageDataC]);

export const pdbLigandC = Codec.interface({
    IUPACInChIkey: string,
    dbId: string,
    pubChemCompoundId: string,
    name: string,
    formula: string,
    formula_weight: number,
    imageLink: string,
    externalLink: string,
    IUPACInChI: string,
    isomericSMILES: string,
    canonicalSMILES: string,
});

export const pdbLigandsC = array(pdbLigandC);

export const pdbEntryResponseC = Codec.interface({
    count: number,
    next: maybeNull(string),
    previous: maybeNull(string),
    results: pdbLigandsC,
});

export type ImageDataResource = GetType<typeof imageDataC>;
export type LigandToImageData = GetType<typeof ligandToImageDataC>;
export type LigandToImageDataResponse = GetType<typeof ligandToImageDataResponseC>;
export type PdbLigandsResponse = GetType<typeof pdbLigandsC>;
export type PdbEntryResponse = GetType<typeof pdbEntryResponseC>;

type PdbLigandResponse = GetType<typeof pdbLigandC>;

export function getPdbLigand(ligand: PdbLigandResponse): PdbLigand {
    return { id: ligand.dbId, name: ligand.name, inChI: ligand.IUPACInChIkey };
}
