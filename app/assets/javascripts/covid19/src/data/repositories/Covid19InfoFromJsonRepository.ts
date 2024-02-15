import _ from "lodash";
import MiniSearch, { Options, SearchResult } from "minisearch";
import {
    Covid19Info,
    Details,
    Emdb,
    Entity,
    Covid19Filter,
    filterEntities,
    Maybe,
    Ligand,
    Organism,
    Pdb,
    Structure,
    PdbValidation,
    filterPdbValidations,
    ValidationSource,
    ValidationMethod,
    filterLigands,
    filterNMR,
} from "../../domain/entities/Covid19Info";
import {
    Covid19InfoRepository,
    SearchOptions,
} from "../../domain/repositories/Covid19InfoRepository";
import { SearchOptions as MiniSearchSearchOptions } from "minisearch";
import { cache } from "../../utils/cache";
import { data } from "../covid19-data";
import * as Data from "../Covid19Data.types";

export class Covid19InfoFromJsonRepository implements Covid19InfoRepository {
    info: Covid19Info;
    searchOptions: MiniSearchSearchOptions = { combineWith: "AND" };

    constructor() {
        this.info = {
            structures: getStructures(),
            validationSources: getValidationSources(),
        };
    }

    get(): Covid19Info {
        return this.info;
    }

    search(options: SearchOptions): Covid19Info {
        const { data, search = "", filter: filterState } = options;
        const { structures } = data;
        const isTextFilterEnabled = Boolean(search.trim());

        const exactMatch = extractExactMatches(search);

        const structuresFilteredByText = isTextFilterEnabled
            ? this.searchByText(structures, exactMatch.search, exactMatch.matches)
            : structures;

        const structuresFilteredByTextAndBody = filterState
            ? this.filter(structuresFilteredByText, filterState)
            : structuresFilteredByText;
        return { ...data, structures: structuresFilteredByTextAndBody };
    }

    autoSuggestions(search: string): string[] {
        const miniSearch = this.getMiniSearch();
        const structuresByText = miniSearch
            .autoSuggest(search, this.searchOptions)
            .map(result => result.suggestion);
        return structuresByText;
    }

    private filter(structures: Structure[], filterState: Covid19Filter): Structure[] {
        const isEntitiesStateEnabled =
            filterState.antibodies || filterState.nanobodies || filterState.sybodies;
        const isPdbValidationsFilterEnabled =
            filterState.pdbRedo || filterState.cstf || filterState.ceres;
        const isIDREnabled = filterState.idr;
        const isNMREnabled = filterState.nmr;

        if (
            !isEntitiesStateEnabled &&
            !isPdbValidationsFilterEnabled &&
            !isIDREnabled &&
            !isNMREnabled
        )
            return structures;

        const structuresWithValidations = isPdbValidationsFilterEnabled
            ? structures.filter(structure =>
                  !_.isEmpty(structure.validations.pdb)
                      ? filterPdbValidations(structure.validations.pdb, filterState)
                      : false
              )
            : structures;

        const structuresWithEntities = isEntitiesStateEnabled
            ? structuresWithValidations.filter(
                  structure => !_.isEmpty(filterEntities(structure.entities, filterState))
              )
            : structuresWithValidations;

        const structuresWithIDR = isIDREnabled
            ? structuresWithEntities.filter(
                  structure => !_.isEmpty(filterLigands(structure.ligands))
              )
            : structuresWithEntities;

        const structuresWithNMR = isNMREnabled
            ? structuresWithIDR.filter(structure => !_.isEmpty(filterNMR(structure.entities)))
            : structuresWithIDR;

        return structuresWithNMR;
    }

    private searchByText(
        structures: Structure[],
        search: string,
        matches: string[] = []
    ): Structure[] {
        const miniSearch = this.getMiniSearch();
        const searchOptions = !_.isEmpty(matches)
            ? {
                  ...this.searchOptions,
                  filter: (result: SearchResult) =>
                      _.isEmpty(
                          _.difference(
                              matches.map(m => m.toLowerCase()),
                              result.terms.map(m => m.toLowerCase())
                          )
                      ),
              }
            : this.searchOptions;
        const results = miniSearch.search(search, searchOptions);
        const matchingIds = results.map(getId);
        return _(structures).keyBy(getId).at(matchingIds).compact().value();
    }

    @cache()
    private getMiniSearch() {
        return getMiniSearch(this.info.structures);
    }
}

function getStructureQueryLink(
    pdb: Data.Pdb | null,
    emdb: Data.Emdb | null,
    validations: Data.RefModel[]
) {
    const pdbUrlId = pdb && pdb.dbId.toLowerCase();
    const emdbUrlId = emdb && "+" + emdb.dbId.toUpperCase();
    const validationUrlIds =
        pdbUrlId && "|" + validations.map(v => getValidationQueryLink(pdbUrlId, v)).join("+");

    return `/${pdbUrlId || ""}${emdbUrlId || ""}${validationUrlIds || ""}`;
}

function getStructures(): Structure[] {
    const structures: Covid19Info["structures"] = _.flatten(data.Structures).map(
        (structure): Structure => ({
            ..._.omit(structure, ["ligand", "organism", "entities"]),
            title: structure.title,
            id: getStructureId(structure),
            pdb: structure.pdb ? getPdb(structure.pdb, structure.emdb) : undefined,
            emdb: structure.emdb ? getEmdb(structure.emdb, structure.pdb) : undefined,
            entities: getEntitiesForStructure(structure.pdb?.entities ?? []),
            organisms: getOrganismsForStructure(data, structure),
            ligands: structure.pdb === null ? [] : getLigands(data.Ligands, structure.pdb.ligands),
            details: structure.pdb ? getDetails(structure.pdb) : undefined,
            validations: {
                pdb: structure.pdb === null ? [] : getPdbValidations(structure.pdb, structure.emdb),
                emdb: [],
            },
            queryLink: getStructureQueryLink(
                structure.pdb,
                structure.emdb,
                structure.pdb?.refModels ?? []
            ),
        })
    );

    const repeatedIds = _(structures)
        .countBy(structure => structure.id)
        .toPairs()
        .map(([structureId, structuresCount]) => (structuresCount > 1 ? structureId : null))
        .compact()
        .value();

    if (!_.isEmpty(repeatedIds)) {
        console.error(`Repeated structure IDs: ${repeatedIds.join(", ")}`);
    }

    return _.uniqBy(structures, getId);
}

function extractExactMatches(search: string) {
    const matches = search.match(/"[^"]+"/g)?.map(match => match.slice(1, -1)) ?? [];
    return {
        search: search.replace('"', ""),
        matches,
    };
}

function getValidationSources(): ValidationSource[] {
    return data.RefModelSources.map(
        (source): ValidationSource => ({
            ...source,
            methods: data.RefModelMethods.filter(method => method.source === source.name).map(
                (method): ValidationMethod => _.omit(method, ["source"])
            ),
        })
    );
}

function getStructureId(structure: Data.Structure): string {
    const parts = [structure.pdb?.dbId, structure.emdb?.dbId];
    return _(parts).compact().join("-");
}

function getOrganismsForStructure(data: Data.Covid19Data, structure: Data.Structure): Organism[] {
    const organismsById = _(data.Organisms)
        .map(
            (organism): Organism => ({
                id: organism.ncbi_taxonomy_id,
                name: organism.scientific_name,
                commonName: organism.common_name,
                externalLink: organism.externalLink,
            })
        )
        .keyBy(getId);

    return _(structure.pdb?.entities)
        .map(ref => (ref.organism ? organismsById.get(ref.organism) : null))
        .compact()
        .uniqBy(getId)
        .value();
}

function getLigands(
    dataLigands: Data.Covid19Data["Ligands"],
    ligandRefs: Data.Pdb["ligands"]
): Ligand[] {
    const ligandsByInChI = _(dataLigands)
        .map(
            (ligand): Ligand => ({
                id: ligand.dbId,
                inChI: ligand.IUPACInChIkey,
                hasIDR: !!ligand.xRef,
                ...ligand,
            })
        )
        .keyBy(ligand => ligand.inChI)
        .value();

    return _(ligandRefs)
        .map(ligandInChI => ligandsByInChI[ligandInChI])
        .compact()
        .value();
}

function getEntitiesForStructure(entities: Data.Entity[]): Entity[] {
    return _(
        entities.map(entity => ({
            ...entity,
            start: entity.seq_align_begin ?? null,
            end: entity.seq_align_end ?? null,
            target: entity.xRef?.find(ref => ref.xDB === "NMR")?.xDB_code ?? null,
        }))
    )
        .compact()
        .value();
}

function getId<T extends { id: string }>(obj: T): string {
    return obj.id;
}

function getPdb(pdb: Data.Pdb, emdb: Data.Emdb | null): Pdb {
    const pdbE: Pdb = {
        id: pdb.dbId,
        method: pdb.method,
        ligands: pdb.ligands,
        keywords: pdb.keywords,
        queryLink: `/${pdb.dbId.toLowerCase()}${emdb ? "+!" + emdb.dbId.toUpperCase() : ""}`,
        imageUrl:
            pdb.imageLink ||
            `https://www.ebi.ac.uk/pdbe/static/entry/${pdb.dbId}_deposited_chain_front_image-200x200.png`,
        externalLinks: pdb.externalLink.includes("www.ebi")
            ? [{ url: pdb.externalLink, text: "EBI" }]
            : [],
        entities: getEntitiesForStructure(pdb.entities),
    };
    return pdbE;
}

function getEmdb(emdb: Data.Emdb, pdb: Data.Pdb | null): Emdb {
    const emdbE: Emdb = {
        id: emdb.dbId,
        queryLink: `/${pdb ? "!" + pdb.dbId.toLowerCase() : ""}+${emdb.dbId.toUpperCase()}`,
        emMethod: emdb.emMethod,
        imageUrl:
            emdb.imageLink ||
            `https://www.ebi.ac.uk/pdbe/static/entry/EMD-${emdb.dbId}/400_${emdb.dbId}.gif`,
        externalLinks: emdb.externalLink.includes("www.ebi")
            ? [{ url: emdb.externalLink, text: "EBI" }]
            : [],
    };
    return emdbE;
}

function getDetails(pdb: Data.Pdb): Maybe<Details> {
    const details = pdb.details?.[0];
    if (!details) return;

    return {
        ...details,
        refdoc: details.refdoc?.map(ref => {
            return { id: ref.pmID, idLink: ref.pmidLink, ...ref };
        }),
    };
}

function getValidationQueryLink(pdbId: string, validation: Data.RefModel) {
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

function getPdbValidations(pdb: Data.Pdb, emdb: Data.Emdb | null): PdbValidation[] {
    const pdbId = pdb.dbId.toLowerCase();
    const emdbId = emdb && emdb.dbId.toUpperCase();
    const getQueryLink = (validation: Data.RefModel) => {
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

/* Search */

function getFields<Obj extends object>(objs: Obj[], keys: Array<keyof Obj>): string {
    return _(objs)
        .flatMap(obj => _.at(obj, keys))
        .compact()
        .join(" - ");
}

const fields = ["title", "details", "pdb", "emdb", "organisms", "ligands", "entities"] as const;

type Field = typeof fields[number];

function getMiniSearch(structures: Structure[]): MiniSearch {
    const miniSearch = new MiniSearch<Structure>({
        fields: Array.from(fields),
        storeFields: [],
        searchOptions: {
            prefix: true,
            fuzzy: 0,
            boost: {
                title: 2,
            },
        },
        extractField: extractField as Options["extractField"],
    });
    miniSearch.addAll(structures);
    return miniSearch;
}

function extractField(structure: Structure, field: Field): string {
    switch (field) {
        case "pdb":
            return structure.pdb?.id || "";
        case "emdb":
            return structure.emdb?.id || "";
        case "organisms":
            return getFields(structure.organisms, ["id", "name", "commonName"]);
        case "ligands":
            return getFields(structure.ligands, ["id", "name", "details"]);
        case "details": {
            if (!structure.details) return "";
            const { sample, refdoc } = structure.details;

            const valuesList = [
                _.flatMap(refdoc, getValuesFromObject),
                getValuesFromObject(sample),
            ];

            return _(valuesList)
                .flatten()
                .reject(value => value.startsWith("http"))
                .uniq()
                .join(" ");
        }
        case "entities":
            return getFields(structure.entities, [
                "uniprotAcc",
                "name",
                "altNames",
                "details",
                "organism",
            ]);
        default:
            return structure[field] || "";
    }
}

function getValuesFromObject(obj: object | undefined): string[] {
    return _.compact(_.flatten(_.values(obj)));
}
