import _ from "lodash";
import MiniSearch, { Options } from "minisearch";
import {
    Covid19Info,
    Details,
    Emdb,
    Entity,
    EntityBodiesFilter,
    filterEntities,
    Maybe,
    Ligand,
    Organism,
    Pdb,
    Structure,
} from "../domain/entities/Covid19Info";
import { Covid19InfoRepository, SearchOptions } from "../domain/repositories/Covid19InfoRepository";
import { cache } from "../utils/cache";
import { data } from "./covid19-data";
import * as Data from "./Covid19Data.types";

export class Covid19InfoFromJsonRepository implements Covid19InfoRepository {
    structuresById: Record<string, Structure>;
    info: Covid19Info;

    constructor() {
        const structures = getStructures();
        this.info = { structures };
        this.structuresById = _.keyBy(structures, structure => structure.id);
    }

    get(): Covid19Info {
        return this.info;
    }

    search(options: SearchOptions): Covid19Info {
        const { search = "", filter: filterState } = options;
        const { structures } = this.info;
        const isTextFilterEnabled = Boolean(search.trim());
        const structuresByText = isTextFilterEnabled ? this.searchStructures(search) : structures;

        const filteredStructures = filterState
            ? this.filterStructures(structuresByText, filterState)
            : structuresByText;

        return { structures: filteredStructures };
    }

    private filterStructures(
        structures: Structure[],
        filterState: EntityBodiesFilter
    ): Structure[] {
        const isFilterStateEnabled =
            filterState && (filterState.antibody || filterState.nanobody || filterState.sybody);
        if (!isFilterStateEnabled) return structures;

        return structures.filter(
            structure => filterEntities(structure.entities, filterState).length > 0
        );
    }

    private searchStructures(search: string): Structure[] {
        const miniSearch = this.getMiniSearch();

        return _(this.structuresById)
            .at(miniSearch.search(search, { combineWith: "AND" }).map(structure => structure.id))
            .compact()
            .value();
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
    if (!pdb.details) return;
    if (pdb.details.length <= 0) return;
    const details = pdb.details[0];
    return {
        ...details,
        refdoc: details?.refdoc?.map(ref => {
            return { id: ref.pmID, idLink: ref.pmidLink, ...ref };
        }),
    };
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
