import _ from "lodash";
import MiniSearch, { Options } from "minisearch";
import {
    buildPdbRedoValidation,
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
} from "../domain/entities/Covid19Info";
import { Covid19InfoRepository, SearchOptions } from "../domain/repositories/Covid19InfoRepository";
import { SearchOptions as MiniSearchSearchOptions } from "minisearch";
import { cache } from "../utils/cache";
import { data } from "./covid19-data";
import * as Data from "./Covid19Data.types";

export class Covid19InfoFromJsonRepository implements Covid19InfoRepository {
    info: Covid19Info;
    searchOptions: MiniSearchSearchOptions = { combineWith: "AND" };

    constructor() {
        this.info = { structures: getStructures() };
    }

    get(): Covid19Info {
        return this.info;
    }

    search(options: SearchOptions): Covid19Info {
        const { data, search = "", filter: filterState } = options;
        const { structures } = data;
        const isTextFilterEnabled = Boolean(search.trim());

        const structuresFilteredByText = isTextFilterEnabled
            ? this.searchByText(structures, search)
            : structures;

        const structuresFilteredByTextAndBody = filterState
            ? this.filterByBodies(structuresFilteredByText, filterState)
            : structuresFilteredByText;
        return { structures: structuresFilteredByTextAndBody };
    }

    autoSuggestions(search: string): string[] {
        const miniSearch = this.getMiniSearch();
        const structuresByText = miniSearch
            .autoSuggest(search, this.searchOptions)
            .map(result => result.suggestion);
        return structuresByText;
    }

    async hasPdbRedoValidation(pdbId: string): Promise<boolean> {
        const validation = buildPdbRedoValidation(pdbId);

        try {
            const res = await fetch(validation.externalLink, { method: "HEAD" });
            return res.status === 200;
        } catch (err) {
            return false;
        }
    }

    private filterByBodies(structures: Structure[], filterState: Covid19Filter): Structure[] {
        const isFilterStateEnabled =
            filterState.antibodies || filterState.nanobodies || filterState.sybodies;
        const isPdbRedoFilterEnabled = filterState.pdbRedo;

        if (!isFilterStateEnabled && !isPdbRedoFilterEnabled) return structures;
        const structuresToFilter = isPdbRedoFilterEnabled
            ? structures.filter(structure => structure.validations.pdb.length > 0)
            : structures;
        return isFilterStateEnabled
            ? structuresToFilter.filter(
                  structure => filterEntities(structure.entities, filterState).length > 0
              )
            : structuresToFilter;
    }

    private searchByText(structures: Structure[], search: string): Structure[] {
        const miniSearch = this.getMiniSearch();
        const matchingIds = miniSearch.search(search, this.searchOptions).map(getId);
        return _(structures).keyBy(getId).at(matchingIds).compact().value();
    }

    @cache()
    private getMiniSearch() {
        return getMiniSearch(this.info.structures);
    }
}

function getStructures(): Structure[] {
    const structures: Covid19Info["structures"] = _.flatten(data.Structures).map(
        (structure): Structure => ({
            ..._.omit(structure, ["ligand", "organism", "entities"]),
            title: structure.title,
            id: getStructureId(structure),
            pdb: structure.pdb ? getPdb(structure.pdb) : undefined,
            emdb: structure.emdb ? getEmdb(structure.emdb) : undefined,
            entities: getEntitiesForStructure(structure),
            organisms: getOrganismsForStructure(data, structure),
            ligands: structure.pdb === null ? [] : getLigands(data.Ligands, structure.pdb.ligands),
            details: structure.pdb ? getDetails(structure.pdb) : undefined,
            validations: { pdb: [], emdb: [] }, // lazily populated on-the fly in the view
        })
    );

    const repeatedIds = _(structures)
        .countBy(structure => structure.id)
        .toPairs()
        .map(([structureId, structuresCount]) => (structuresCount > 1 ? structureId : null))
        .compact()
        .value();

    if (repeatedIds.length > 0) {
        console.error(`Repeated structure IDs: ${repeatedIds.join(", ")}`);
    }

    return _.uniqBy(structures, getId);
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
    const ligandsById = _(dataLigands)
        .map((ligand): Ligand => ({ id: ligand.dbId, ...ligand }))
        .keyBy(getId)
        .value();

    return _(ligandRefs)
        .map(ligandId => ligandsById[ligandId])
        .compact()
        .value();
}

function getEntitiesForStructure(structure: Data.Structure): Entity[] {
    return _(structure.pdb?.entities).compact().value();
}

function getId<T extends { id: string }>(obj: T): string {
    return obj.id;
}

function getPdb(pdb: Data.Pdb): Pdb {
    const entities = pdb.entities.map(entity => ({ id: pdb.dbId, ...entity }));
    const pdbE: Pdb = {
        id: pdb.dbId,
        method: pdb.method,
        ligands: pdb.ligands,
        keywords: pdb.keywords,
        queryLink: pdb.queryLink,
        imageUrl:
            pdb.imageLink ||
            `https://www.ebi.ac.uk/pdbe/static/entry/${pdb.dbId}_deposited_chain_front_image-200x200.png`,
        externalLinks: pdb.externalLink.includes("www.ebi")
            ? [{ url: pdb.externalLink, text: "EBI" }]
            : [],
        entities,
    };
    return pdbE;
}

function getEmdb<T extends Data.Emdb>(emdb: T): Emdb {
    const emdbE: Emdb = {
        id: emdb.dbId,
        queryLink: emdb.queryLink,
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
    if (pdb.details == null) return;
    if (pdb.details.length <= 0) return;
    const details: Details = {
        refEMDB: pdb.details[0]?.refEMDB,
        refPDB: pdb.details[0]?.refPDB,
        sample: pdb.details[0]?.sample,
        refdoc: pdb.details[0]?.refdoc?.map(ref => {
            return { id: ref.pmID, idLink: ref.pmidLink, ...ref };
        }),
    };
    return details;
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
        searchOptions: { prefix: true, fuzzy: 0.1 },
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
        case "details":
            return "";
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
