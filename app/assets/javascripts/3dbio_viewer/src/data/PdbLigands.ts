import _ from "lodash";
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
import {
    AdditionalAnalysisCompound,
    Assay,
    OntologyTerm,
    Organism,
    Plate,
    Screen,
    Well,
} from "../domain/entities/LigandImageData";
import { Ontology, OntologyTerm as BioOntologyTerm } from "../domain/entities/Ontology";
import { PdbLigand } from "../domain/entities/Pdb";

function maybeNull<Data>(type: Codec<Data>) {
    return oneOf([type, nullType]);
}

const additionalAnalysisC = Codec.interface({
    name: string,
    relation: exactly("'<'", "'>'", "'='"),
    value: number,
    description: string,
    units: maybeNull(string),
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
    controlType: optional(string),
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
    description: string,
    screenTypes: array(string),
    technologyTypes: array(string),
    imagingMethods: array(string),
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

const assayC = Codec.interface({
    dbId: string,
    name: string,
    description: string,
    assayTypes: array(string),
    organisms: array(string),
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
    imageData: optional(array(imageDataC)), //it shouldn't be an array...
});

export const pdbLigandsC = array(pdbLigandC);

export const pdbEntryResponseC = Codec.interface({
    count: number,
    next: maybeNull(string),
    previous: maybeNull(string),
    results: pdbLigandsC,
});

export type ImageDataResource = GetType<typeof imageDataC>;
export type PdbLigandsResponse = GetType<typeof pdbLigandsC>;
export type PdbEntryResponse = GetType<typeof pdbEntryResponseC>;

type IDRWell = GetType<typeof wellC>;
type PdbLigandResponse = GetType<typeof pdbLigandC>;

interface PdbLigandsOptions {
    ligand: PdbLigandResponse;
    ontologies: Ontology[];
    ontologyTerms: BioOntologyTerm[];
    organisms: Organism[];
}

export function getPdbLigand(pdbLigandOptions: PdbLigandsOptions): PdbLigand {
    const { ligand, ontologies, ontologyTerms, organisms } = pdbLigandOptions;

    if (ligand.imageData && ligand.imageData.length > 1)
        throw new Error("Error: there is more than one IDR.");
    const idr = _.first(
        ligand.imageData?.map(idr => ({
            ...idr,
            assays: idr.assays.map(
                (assay): Assay => {
                    const { screens, additionalAnalyses, dbId, BIAId, assayTypes } = assay;

                    //Compound: inhibition cytopathicity
                    const wellsFromPlates = screens
                        .find(({ dbId }) => dbId === "2602")
                        ?.plates.map(({ wells }) => wells);
                    const allPercentageInhibition = wellsFromPlates
                        ?.map(plate =>
                            plate.flatMap(({ percentageInhibition }) =>
                                percentageInhibition ? [`${percentageInhibition} %`] : []
                            )
                        )
                        .join(", "); //it should be only one...¿?, but just in case...

                    //Compounds: cytotoxicity, dose response, cytotoxic index
                    const aac = additionalAnalyses.map(
                        (aa): AdditionalAnalysisCompound => {
                            const units = ontologyTerms.find(term => term.id === aa.units);

                            return {
                                ...aa,
                                relation: aa.relation.replaceAll("'", "") as "<" | ">" | "=", //intented to be replaced by without quotes, forcing types for now
                                units: units ? addOntology(units, ontologies) : undefined,
                                pvalue: aa.pvalue ?? undefined,
                            };
                        }
                    );

                    const cytotoxicity = aac.find(({ name }) => name === "CC50");
                    const doseResponse = aac.find(({ name }) => name === "IC50");
                    const cytotoxicIndex = aac.find(({ name }) => name === "Selectivity index");

                    return {
                        ...assay,
                        id: dbId,
                        type: ontologyTerms
                            .filter(term => assayTypes.includes(term.id))
                            .map(ontologyTerm => addOntology(ontologyTerm, ontologies)),
                        bioStudiesAccessionId: BIAId,
                        organisms: organisms.filter(organism =>
                            assay.organisms.includes(organism.id)
                        ),
                        screens: screens.map(
                            (screen): Screen => ({
                                ...screen,
                                id: screen.dbId,
                                doi: screen.dataDoi,
                                type: ontologyTerms
                                    .filter(term => screen.screenTypes.includes(term.id))
                                    .map(ontologyTerm => addOntology(ontologyTerm, ontologies)),
                                technologyType: ontologyTerms
                                    .filter(term => screen.technologyTypes.includes(term.id))
                                    .map(ontologyTerm => addOntology(ontologyTerm, ontologies)),
                                imagingMethod: ontologyTerms
                                    .filter(term => screen.imagingMethods.includes(term.id))
                                    .map(ontologyTerm => addOntology(ontologyTerm, ontologies)),
                                plates: screen.plates.map(
                                    (plate): Plate => ({
                                        id: plate.dbId,
                                        name: plate.name,
                                        wells: plate.wells.flatMap(well =>
                                            flatMapWell(well, ontologies, ontologyTerms)
                                        ),
                                        controlWells: plate.controlWells.flatMap(well =>
                                            flatMapWell(well, ontologies, ontologyTerms)
                                        ),
                                    })
                                ),
                            })
                        ),
                        compound: {
                            name: ligand.name,
                            percentageInhibition: allPercentageInhibition,
                            cytotoxicity,
                            cytotoxicIndex,
                            doseResponse,
                        },
                    };
                }
            ),
        }))
    );

    return {
        name: ligand.name,
        inChI: ligand.IUPACInChIkey,
        imageDataResource: idr,
    };
}

function flatMapWell(
    well: IDRWell,
    ontologies: Ontology[],
    ontologyTerms: BioOntologyTerm[]
): Well[] {
    const [_void, a, b] = well.name.toLowerCase().split(/^(.)/);
    const x = b ? _.toNumber(b) - 1 : undefined;
    const codePoint = a && a.codePointAt(0);
    const y = codePoint ? _.clamp(codePoint - 97, 0, 7) : undefined;
    const cellLine = ontologyTerms.find(term => well.cellLine === term.id);

    if ((x === 0 || x) && (y || y === 0))
        return [
            {
                id: well.dbId,
                position: { x, y },
                image: well.imageThumbailLink,
                cellLine: cellLine ? addOntology(cellLine, ontologies) : undefined,
                controlType: well.controlType,
                qualityControl: well.qualityControl,
                micromolarConcentration: well.micromolarConcentration,
                percentageInhibition: well.percentageInhibition,
                hitCompound: well.hitOver75Activity,
                numberOfCells: well.numberCells,
                phenotypeAnnotation: well.phenotypeAnnotationLevel,
                channels: well.channels,
                externalLink: well.externalLink,
            },
        ];
    return [];
}

function addOntology(ontologyTerm: BioOntologyTerm, ontologies: Ontology[]): OntologyTerm {
    return {
        ...ontologyTerm,
        source: ontologies.find(ontology => ontology.id === ontologyTerm.source),
    };
}
