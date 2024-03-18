import _ from "lodash";
import {
    Covid19Info,
    Details,
    Maybe,
    PdbValidation,
    Structure,
    ValidationMethod,
    ValidationSource,
} from "../../domain/entities/Covid19Info";
import {
    Covid19InfoRepository,
    GetOptions,
    SearchOptions,
} from "../../domain/repositories/Covid19InfoRepository";
import { data } from "../covid19-data";
import { routes } from "../../routes";
import { getJSONData } from "../utils/request-utils";
import { FutureData } from "../../domain/entities/FutureData";
import { Future } from "../utils/future";

export class Covid19InfoApiRepository implements Covid19InfoRepository {
    get(options: GetOptions): FutureData<Covid19Info> {
        const covidInfo$ = Future.joinObj({
            pdbEntries: getPdbEntries({
                page: options.page ?? 0,
                pageSize: options.pageSize ?? 10,
                filter: options.filter,
            }),
            validationSources: getPdbRefModelSources(),
        }).map(({ pdbEntries, validationSources }) => ({
            count: pdbEntries.count,
            structures: pdbEntries.structures,
            validationSources,
        }));

        return covidInfo$;
    }

    search(_options: SearchOptions): Covid19Info {
        throw new Error("Method not implemented.");
    }

    autoSuggestions(_search: string): string[] {
        throw new Error("Method not implemented.");
    }
}

function getPdbRefModelSources(): FutureData<ValidationSource[]> {
    return Future.success(
        data.RefModelSources.map(
            (source): ValidationSource => ({
                ...source,
                methods: data.RefModelMethods.filter(method => method.source === source.name).map(
                    (method): ValidationMethod => _.omit(method, ["source"])
                ),
            })
        )
    );
}

function getPdbEntries(
    options: Required<GetOptions>
): FutureData<{ count: number; structures: Structure[] }> {
    const { bionotesApi: _bionotesApi } = routes;
    const { page, pageSize, filter: f } = options;

    const filterParams = {
        is_antibody: f.antibodies,
        is_nanobody: f.nanobodies,
        is_sybody: f.sybodies,
        is_pdb_redo: f.pdbRedo,
        is_cstf: f.cstf,
        is_ceres: f.ceres,
        is_idr: f.idr,
    };

    const params = new URLSearchParams(
        _.mapValues(
            {
                limit: pageSize,
                page: page + 1,
                ..._.pickBy(filterParams, v => Boolean(v)),
            },
            v => v?.toString()
        )
    );

    const pagination$ = getJSONData<Pagination<PdbEntry>>(
        `http://server:8000/api/pdbentry/?${params.toString()}` //django starts from 1
    );

    return pagination$.map(({ count, results: pdbEntries }) => ({
        count,
        structures: pdbEntries.map(buildStructure),
    }));
}

function buildStructure(pdbEntry: PdbEntry): Structure {
    const { emdb } = pdbEntry;

    const entities = pdbEntry.entities.map(e => ({
        ...e,
        uniprotAcc: e.uniprotAcc?.dbId ?? null,
        organism: e.organism?.ncbi_taxonomy_id ?? null,
    }));

    const organisms = pdbEntry.entities
        .flatMap(e => (e.organism ? [e.organism] : []))
        .map(o => ({
            id: o.ncbi_taxonomy_id,
            name: o.scientific_name,
            commonName: o.common_name,
            externalLink: o.externalLink,
        }));

    const ligands = pdbEntry.ligands.map(l => ({
        id: l.dbId,
        name: l.name,
        details: l.name, //huh¿ (database issue btw)
        imageLink: l.imageLink,
        externalLink: l.externalLink,
        inChI: l.IUPACInChIkey,
        hasIDR: (l.imageData?.length ?? 0) > 0,
    }));

    return {
        id: pdbEntry.dbId,
        title: pdbEntry.title,
        entities: _.uniqBy(entities, "name"),
        pdb: {
            id: pdbEntry.dbId,
            method: pdbEntry.method,
            ligands: pdbEntry.ligands.map(ligand => ligand.IUPACInChIkey),
            keywords: pdbEntry.keywords,
            queryLink: `/${pdbEntry.dbId.toLowerCase()}${
                emdb ? "+!" + emdb.dbId.toUpperCase() : ""
            }`,
            imageUrl:
                pdbEntry.imageLink ||
                `https://www.ebi.ac.uk/pdbe/static/entry/${pdbEntry.dbId}_deposited_chain_front_image-200x200.png`,
            externalLinks: [{ url: pdbEntry.externalLink, text: "EBI" }],
            entities,
        },
        emdb: emdb && {
            id: emdb.dbId,
            queryLink: `/${
                pdbEntry ? "!" + pdbEntry.dbId.toLowerCase() : ""
            }+${emdb.dbId.toUpperCase()}`,
            emMethod: emdb.emMethod,
            imageUrl:
                emdb.imageLink ||
                `https://www.ebi.ac.uk/pdbe/static/entry/EMD-${emdb.dbId}/400_${emdb.dbId}.gif`,
            externalLinks: [{ url: emdb.externalLink, text: "EBI" }],
            resolution: emdb.resolution,
        },
        organisms: _.uniqBy(organisms, "id"),
        ligands: _.uniqBy(ligands, "id"),
        details: getDetails(pdbEntry.details),
        validations: { pdb: getPdbValidations(pdbEntry, emdb ?? null), emdb: [] },
        queryLink: pdbEntry.queryLink,
    };
}

function getValidationQueryLink(pdbId: string, validation: RefModel) {
    switch (validation.source) {
        case "PDB-REDO":
            return pdbId + "-pdbRedo";
        case "CSTF":
            return pdbId + "-cstf";
        case "CERES":
            return pdbId + "-ceres";
        default:
            console.error(`Validation not supported: "${validation.source}"`);
            return undefined;
    }
}

function getPdbValidations(pdb: PdbEntry, emdb: Emdb | null): PdbValidation[] {
    const pdbId = pdb.dbId.toLowerCase();
    const emdbId = emdb && emdb.dbId.toUpperCase();
    const getQueryLink = (validation: RefModel) => {
        return `/${pdbId}${emdbId ? "+" + emdbId : ""}|${getValidationQueryLink(
            pdbId,
            validation
        )}`;
    };
    return pdb.refModels
        ? _.compact(
              pdb.refModels?.map((validation): PdbValidation | undefined => {
                  switch (validation.source) {
                      case "PDB-REDO":
                          return {
                              ...validation,
                              queryLink: getQueryLink(validation),
                              badgeColor: "w3-orange",
                          };
                      case "CSTF":
                          return {
                              ...validation,
                              queryLink: getQueryLink(validation),
                              badgeColor: "w3-cyan",
                          };
                      case "CERES":
                          return {
                              ...validation,
                              queryLink: undefined,
                              badgeColor: "w3-blue",
                          };
                      default:
                          console.error(`Validation not supported: "${validation.source}"`);
                          return undefined;
                  }
              })
          )
        : [];
}

function getDetails(details: Detail[]): Maybe<Details> {
    const detail = details?.[0];
    if (!detail) return;

    return {
        ...detail,
        refdoc: detail.refdoc?.map(ref => {
            return { id: ref.pmID, idLink: ref.pmidLink, ...ref };
        }),
    };
}

type Pagination<T extends object> = {
    count: number;
    next: string;
    results: T[];
};

export interface PdbEntry {
    dbId: string;
    title: string;
    emdb?: Emdb;
    method: string;
    keywords: string;
    refModels: RefModel[];
    entities: Entity[];
    ligands: Ligand[];
    dbauthors: string[];
    details: Detail[];
    imageLink: string;
    externalLink: string;
    queryLink: string;
}

export interface Emdb {
    dbId: string;
    title: string;
    emMethod: string;
    resolution: string;
    status: string;
    details: string;
    imageLink: string;
    externalLink: string;
}

export type SourceName = PdbSourceName | "IDR";
export type PdbSourceName = "PDB-REDO" | "CSTF" | "CERES";
export type MethodName = PdbMethodName | "IDR";
export type PdbMethodName = "PDB-Redo" | "Isolde" | "Refmac" | "PHENIX";

export interface RefModel {
    source: PdbSourceName;
    method: PdbMethodName;
    filename: string;
    externalLink: string;
    details: string;
}

export interface Entity {
    uniprotAcc?: UniprotAcc;
    organism?: Organism;
    name: string;
    details: string;
    altNames: string;
    isAntibody: boolean;
    isNanobody: boolean;
    isSybody: boolean;
}

export interface UniprotAcc {
    dbId: string;
    name: string;
    externalLink: string;
}

export interface Organism {
    ncbi_taxonomy_id: string;
    scientific_name: string;
    common_name: string;
    externalLink: string;
}

export interface Ligand {
    IUPACInChIkey: string;
    dbId: string;
    name: string;
    formula: string;
    formula_weight: number;
    imageLink: string;
    externalLink: string;
    pubChemCompoundId: string;
    IUPACInChI: string;
    isomericSMILES: string;
    canonicalSMILES: string;
    imageData?: ImageData[];
}

export interface ImageData {
    dataSource: string;
    name: string;
    description: string;
    externalLink: string;
    assays: Assay[];
}

export interface Assay {
    dbId: string;
    name: string;
    description: string;
    assayTypes: string[];
    organisms: string[];
    externalLink: string;
    releaseDate: string;
    publications: Publication[];
    dataDoi: string;
    BIAId: string;
    screenCount: number;
    screens: Screen[];
    additionalAnalyses: any[];
}

export interface Publication {
    title: string;
    journal_abbrev: string;
    issn: string;
    issue: string;
    volume: string;
    page_first: string;
    page_last: string;
    year: string;
    doi: string;
    pubMedId: string;
    PMCId: string;
    abstract: string;
    authors: Author[];
}

export interface Author {
    name: string;
    email: string;
    address: string;
    orcid: string;
    role: string;
}

export interface Screen {
    dbId: string;
    name: string;
    description: string;
    screenTypes: string[];
    technologyTypes: string[];
    imagingMethods: string[];
    sampleType: string;
    dataDoi: string;
    plateCount: any;
    plates: Plate[];
}

export interface Plate {
    dbId: string;
    name: string;
    wells: Well[];
    controlWells: ControlWell[];
}

export interface Well {
    dbId: string;
    name: string;
    externalLink: string;
    imagesIds: string;
    imageThumbailLink: string;
    cellLine: string;
    controlType: string;
    qualityControl: string;
    micromolarConcentration: number;
    percentageInhibition: number;
    hitOver75Activity: string;
    numberCells: number;
    phenotypeAnnotationLevel: string;
    channels: string;
}

export interface ControlWell {
    dbId: string;
    name: string;
    externalLink: string;
    imagesIds: string;
    imageThumbailLink: string;
    cellLine: string;
    controlType: string;
    qualityControl: string;
    micromolarConcentration: any;
    percentageInhibition: number;
    hitOver75Activity: string;
    numberCells: number;
    phenotypeAnnotationLevel: string;
    channels: string;
}

export interface Detail {
    sample: Sample;
    refdoc: Refdoc[];
}

export interface Sample {
    name: string;
    exprSystem: string;
    assembly: string;
    genes: any[];
}

export interface Refdoc {
    pmID: string;
    title: string;
    journal: string;
    doi: string;
    pmidLink: string;
    pubDate: string;
    abstract: string;
    authors: any[];
}
