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
    SortingFields,
} from "../../domain/repositories/Covid19InfoRepository";
import { data } from "../covid19-data";
import { routes } from "../../routes";
import { getJSONData } from "../utils/request-utils";
import { FutureData } from "../../domain/entities/FutureData";
import { Future } from "../utils/future";

export class Covid19InfoApiRepository implements Covid19InfoRepository {
    get(options: GetOptions): FutureData<Covid19Info> {
        const covidInfo$ = Future.joinObj({
            pdbEntries: getPdbEntries(options),
            validationSources: getPdbRefModelSources(),
        }).map(({ pdbEntries, validationSources }) => ({
            count: pdbEntries.count,
            structures: pdbEntries.structures,
            validationSources,
        }));

        return covidInfo$;
    }

    autoSuggestions(search: string): FutureData<string[]> {
        const { bionotesApi } = routes;

        const params = new URLSearchParams({
            q: search,
        });

        const suggestions$ = getJSONData<{ results: string[] }>(
            `${bionotesApi}/complete/search?${params.toString()}`
        ).map(({ results }) =>
            _(results)
                .map(v => v.trim())
                .uniq()
                .value()
        );

        return suggestions$;
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

const sortingFields: Record<SortingFields, string> = {
    pdb: "dbId",
    title: "title",
    releaseDate: "relDate",
    emdb: "emdbs__dbId",
};

function getPdbEntries(
    options: GetOptions
): FutureData<{ count: number; structures: Structure[] }> {
    const { bionotesApi } = routes;
    const { page, pageSize, filter: f, sort, query } = options;

    const filterParams = {
        is_antibody: f.antibodies,
        is_nanobody: f.nanobodies,
        is_sybody: f.sybodies,
        is_pdb_redo: f.pdbRedo,
        is_cstf: f.cstf,
        is_ceres: f.ceres,
        is_idr: f.idr,
        q: query ?? "",
    };

    const params = new URLSearchParams(
        _.mapValues(
            {
                limit: pageSize,
                page: page,
                ordering: `${sort.order === "asc" ? "" : "-"}${sortingFields[sort.field]}`,
                ..._.pickBy(filterParams, v => Boolean(v)),
            },
            v => v.toString()
        )
    );

    const pagination$ = getJSONData<Pagination<PdbEntry>>(
        `${bionotesApi}/pdbentry/?${params.toString()}`
    );

    return pagination$.map(({ count, results: pdbEntries }) => ({
        count,
        structures: pdbEntries.map(buildStructure),
    }));
}

function buildStructure(pdbEntry: PdbEntry): Structure {
    const { emdbs } = pdbEntry;

    const emdb = _.first(emdbs);

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
        imageLink: l.imageLink,
        externalLink: l.externalLink,
        inChI: l.IUPACInChIkey,
        hasIDR: l.well.length > 0,
    }));

    const queryLink = `/${pdbEntry.dbId.toLowerCase()}${emdb ? emdb.dbId.toUpperCase() : ""}`;
    const pdbQueryLink = `/${pdbEntry.dbId.toLowerCase()}${
        emdb ? "+!" + emdb.dbId.toUpperCase() : ""
    }`;

    return {
        id: pdbEntry.dbId,
        title: pdbEntry.title,
        entities: _.uniqBy(entities, "name"),
        pdb: {
            id: pdbEntry.dbId,
            method: pdbEntry.method,
            ligands: pdbEntry.ligands.map(ligand => ligand.IUPACInChIkey),
            keywords: pdbEntry.keywords,
            queryLink: pdbQueryLink,
            imageUrl: pdbEntry.imageLink,
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
        queryLink: queryLink,
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

    const pdbValidation = (validation: RefModel): PdbValidation | undefined => {
        const validationQuery = getValidationQueryLink(pdbId, validation);
        const queryLink = `/${pdbId}${emdbId ? "+" + emdbId : ""}|${validationQuery}`;

        switch (validation.source) {
            case "PDB-REDO":
                return {
                    ...validation,
                    queryLink,
                    badgeColor: "w3-orange",
                };
            case "CSTF":
                return {
                    ...validation,
                    queryLink,
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
    };

    return _.compact(pdb.refModels.map(pdbValidation));
}

function getDetails(details: Detail[]): Maybe<Details> {
    const detail = _.first(details);
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

interface PdbEntry {
    dbId: string;
    title: string;
    emdbs: Emdb[];
    method: string;
    keywords: string;
    refModels: RefModel[];
    entities: Entity[];
    ligands: Ligand[];
    dbauthors: string[];
    details: Detail[];
    imageLink: string;
    externalLink: string;
}

interface Emdb {
    dbId: string;
    title: string;
    emMethod: string;
    resolution: string;
    status: string;
    details: string;
    imageLink: string;
    externalLink: string;
}

type PdbSourceName = "PDB-REDO" | "CSTF" | "CERES";
type PdbMethodName = "PDB-Redo" | "Isolde" | "Refmac" | "PHENIX";

interface RefModel {
    source: PdbSourceName;
    method: PdbMethodName;
    filename: string;
    externalLink: string;
    details: string;
}

interface Entity {
    uniprotAcc?: UniprotAcc;
    organism?: Organism;
    name: string;
    details: string;
    altNames: string;
    isAntibody: boolean;
    isNanobody: boolean;
    isSybody: boolean;
}

interface UniprotAcc {
    dbId: string;
    name: string;
    externalLink: string;
}

interface Organism {
    ncbi_taxonomy_id: string;
    scientific_name: string;
    common_name: string;
    externalLink: string;
}

interface Ligand {
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
    well: string[];
}

interface Detail {
    sample: Sample;
    refdoc: Refdoc[];
}

interface Sample {
    name: string;
    exprSystem: string;
    assembly: string;
    genes: any[];
}

interface Refdoc {
    pmID: string;
    title: string;
    journal: string;
    doi: string;
    pmidLink: string;
    pubDate: string;
    abstract: string;
    authors: any[];
}
