import _ from "lodash";
import {
    ComputationalModel,
    Covid19Info,
    Emdb,
    Entity,
    Ligand,
    Maybe,
    Organism,
    Pdb,
    Structure,
} from "../domain/entities/Covid19Info";
import { Covid19InfoRepository } from "../domain/repositories/Covid19InfoRepository";
import { data } from "./covid19-data";
import * as Data from "./Covid19Data.types";

export class Covid19InfoFromJsonRepository implements Covid19InfoRepository {
    get(): Covid19Info {
        const structures: Covid19Info["structures"] = data.Structures.map(
            (structure): Structure => ({
                ..._.omit(structure, ["ligand", "organism", "entities", "compModel"]),
                title: structure.title,
                id: getStructureId(structure),
                pdb: structure.pdb ? getPdb(structure.pdb) : undefined,
                emdb: structure.emdb ? getEmdb(structure.emdb) : undefined,
                computationalModel: getComputationModel(structure.compModel),
                entities: getEntitiesForStructure(data, structure),
                organisms: getOrganismsForStructure(data, structure),
                ligands: getLigands(data.Ligands, structure.pdb.ligands),
                details: "",
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

        return { structures: _.uniqBy(structures, getId) };
    }
}

function getStructureId(structure: Data.Structure): string {
    const parts = [structure.pdb?.dbId, structure.emdb?.dbId];
    return _(parts).compact().join("-");
}

function getComputationModel(
    dataCompModel: Maybe<Data.ComputationalModel>
): ComputationalModel | undefined {
    if (!dataCompModel) return undefined;

    switch (dataCompModel.source) {
        case "SWISS-MODEL":
            return {
                ...dataCompModel,
                name: [dataCompModel.project, dataCompModel.model].join("-"),
                externalLink: dataCompModel.externalLink,
                queryLink: dataCompModel.queryLink,
                imageLink: dataCompModel.imageLink,
            };
        case "BSM-Arc":
        case "AlphaFold":
            return {
                ...dataCompModel,
                name: dataCompModel.model,
                externalLink: dataCompModel.externalLink,
                queryLink: dataCompModel.queryLink,
            };
    }
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

    return _(structure.pdb.entities)
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
function getEntitiesForStructure(data: Data.Covid19Data, structure: Data.Structure): Entity[] {
    const entitiesById = _(data.Entities)
        .map(
            (entity): Entity => ({
                id: entity.uniprotAcc !== null ? entity.uniprotAcc : "",
                ...entity,
            })
        )
        .keyBy(getId);

    return _(structure.pdb.entities)
        .map(ref => (ref.uniprotAcc ? entitiesById.get(ref.uniprotAcc) : null))
        .compact()
        .uniqBy(getId)
        .value();
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
        ..._.omit(emdb, ["imageLink", "externalLink"]),
        imageUrl:
            emdb.imageLink ||
            `https://www.ebi.ac.uk/pdbe/static/entry/EMD-${emdb.dbId}/400_${emdb.dbId}.gif`,
        externalLinks: emdb.externalLink.includes("www.ebi")
            ? [{ url: emdb.externalLink, text: "EBI" }]
            : [],
    };
    return emdbE;
}
