import _ from "lodash";
import { array, Codec, GetType, nullType, number, oneOf, optional, string } from "purify-ts";
import { Organism, Plate, Screen, Well } from "../domain/entities/LigandImageData";
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

export function getPdbLigand(ligand: PdbLigandResponse): PdbLigand {
    if (ligand.imageData && ligand.imageData.length > 1)
        throw new Error("Error: there is more than one IDR.");
    const idr = _.first(
        ligand.imageData?.map(idr => ({
            ...idr,
            assays: idr.assays.map(assay => {
                const {
                    screens,
                    additionalAnalyses,
                    dbId,
                    assayType,
                    assayTypeTermAccession,
                } = assay;

                //Compound: inhibition cytopathicity
                const wellsFromPlates = screens
                    .find(({ dbId }) => dbId === "2602")
                    ?.plates.map(({ wells }) => wells);
                const allPercentageInhibition = wellsFromPlates
                    ?.map(plate =>
                        plate.flatMap(({ percentageInhibition }) =>
                            percentageInhibition ? [`${percentageInhibition}%`] : []
                        )
                    )
                    .join(", "); //it should be only one...¿?, but just in case...

                //Compounds: cytotoxicity, dose response, cytotoxic index
                const cytotoxicity = additionalAnalyses.find(({ name }) => name === "CC50");
                const doseResponse = additionalAnalyses.find(({ name }) => name === "IC50");
                const cytotoxicIndex = additionalAnalyses.find(
                    ({ name }) => name === "Selectivity index"
                );

                return {
                    ...assay,
                    id: dbId,
                    type: assayType,
                    typeTermAccession: assayTypeTermAccession,
                    bioStudiesAccessionId: assay.BIAId,
                    organisms: assay.organisms.map(
                        (organism): Organism => ({
                            id: organism.ncbi_taxonomy_id,
                            name: organism.scientific_name,
                            commonName: organism.common_name,
                            externalLink: organism.externalLink,
                        })
                    ),
                    screens: screens.map(
                        (screen): Screen => ({
                            ...screen,
                            id: screen.dbId,
                            doi: screen.dataDoi,
                            well: _.first(_.first(screen.plates)?.wells)?.externalLink,
                            plates: screen.plates.map(
                                (plate): Plate => ({
                                    id: plate.dbId,
                                    name: plate.name,
                                    wells: plate.wells.flatMap(flatMapWell),
                                    controlWells: plate.controlWells.flatMap(flatMapWell),
                                })
                            ),
                        })
                    ),
                    compound: {
                        name: ligand.name,
                        percentageInhibition: allPercentageInhibition,
                        cytotoxicity: cytotoxicity
                            ? `${cytotoxicity.value} ${cytotoxicity.units ?? ""}`
                            : undefined,
                        cytotoxicityIndex: cytotoxicIndex
                            ? `${cytotoxicIndex.value} ${cytotoxicIndex.units ?? ""}`
                            : undefined,
                        doseResponse: doseResponse
                            ? `${doseResponse.value} ${doseResponse.units ?? ""}`
                            : undefined,
                    },
                };
            }),
        }))
    );

    return {
        id: ligand.dbId,
        name: ligand.name,
        inChI: ligand.IUPACInChIkey,
        imageDataResource: idr,
    };
}

function flatMapWell(well: IDRWell): Well[] {
    const [_void, a, b] = well.name.toLowerCase().split(/^(.)/);
    const x = b ? _.toNumber(b) - 1 : undefined;
    const codePoint = a && a.codePointAt(0);
    const y = codePoint ? _.clamp(codePoint - 97, 0, 7) : undefined;
    if ((x === 0 || x) && (y || y === 0))
        return [
            {
                id: well.dbId,
                position: { x, y },
                image: well.imageThumbailLink,
                cellLine: well.cellLine,
                cellLineTermAccession: well.cellLineTermAccession,
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
