import _ from "lodash";
import {
    ComputationalModel,
    Covid19Info,
    Emdb,
    Entity,
    LigandInstance,
    Organism,
    Pdb,
    Structure,
} from "../domain/entities/Covid19Info";
import { Covid19InfoRepository } from "../domain/repositories/Covid19InfoRepository";
import { data } from "./covid19-data";
import * as Data from "./Covid19Data.types";

export class Covid19InfoFromJsonRepository implements Covid19InfoRepository {
    get(): Covid19Info {
        return {
            //organisms: removeEmptyValues(data.Organisms),
            structures: data.Structures.map(
                (structure): Structure => ({
                    ..._.omit(structure, ["ligand", "organism", "entities"]),
                    title: (structure.title || []).join(", "),
                    id: structure.entity.join("-"),
                    pdb: structure.pdb ? getPdb(structure.pdb) : undefined,
                    emdb: structure.emdb ? getEmdb(structure.emdb) : undefined,
                    computationalModel: getComputationModel(structure.compModel),
                    entities: getEntities(data.Entities, structure.entity),
                    ligands: getLigands(data.Ligands, structure.ligand),
                    organisms: getOrganisms(data.Organisms, structure.organism),
                    details: "",
                })
            ),
        };
    }
}

function getComputationModel(
    dataCompModel: Data.ComputationalModel | null
): ComputationalModel | undefined {
    if (!dataCompModel) return undefined;

    return {
        ...dataCompModel,
        externalLink: dataCompModel.externalLink[0],
        queryLink: dataCompModel.queryLink[0],
        imageLink: dataCompModel.imageLink?.[0],
    };
}

function getLigands(
    dataLigands: Data.Covid19Data["Ligands"],
    ligandRefs: Data.LigandRef[] | undefined
): LigandInstance[] {
    const ligandsById = _(dataLigands)
        .map((ligand, ligandId) => ({ id: ligandId, ...ligand }))
        .keyBy(getId)
        .value();

    return _(ligandRefs)
        .flatMap(ligandRef => _.toPairs(ligandRef))
        .map(([ligandId, { instances }]): LigandInstance | null => {
            const ligandInfo = ligandsById[ligandId];
            return instances && ligandInfo
                ? {
                      instances,
                      info: {
                          ...withPluralNames(ligandInfo),
                          imageLink: _.first(ligandInfo.imageLink),
                          externalLink: _.first(ligandInfo.externalLink),
                      },
                  }
                : null;
        })
        .compact()
        .value();
}

function getOrganisms(
    dataOrganisms: Data.Covid19Data["Organisms"],
    organismIds: string[] | undefined
): Organism[] {
    const organismsById = _(dataOrganisms)
        .map((organism, organismId): Organism | null =>
            organism ? { id: organismId, ...organism } : null
        )
        .compact()
        .keyBy(getId)
        .value();

    return _(organismIds)
        .map(organismId => organismsById[organismId])
        .compact()
        .value();
}

function getEntities(
    dataEntities: Data.Covid19Data["Entities"],
    entityIds: string[] | undefined
): Entity[] {
    const entititesById = _(dataEntities)
        .map((entity, entityId): Entity | null =>
            entity ? { id: entityId, ...withPluralNames(entity) } : null
        )
        .compact()
        .keyBy(getId)
        .value();

    return _(entityIds)
        .map(entityId => entititesById[entityId])
        .compact()
        .value();
}

function getId<T extends { id: string }>(obj: T): string {
    return obj.id;
}

function getPdb<T extends Data.Pdb>(pdb: T): Pdb {
    return {
        ...pdb,
        imageUrl:
            pdb.imageLink?.[0] ||
            `https://www.ebi.ac.uk/pdbe/static/entry/${pdb.id}_deposited_chain_front_image-200x200.png`,
        externalLinks: _.compact(
            pdb.externalLink.map(externalLink => {
                return externalLink.includes("www.ebi") ? { url: externalLink, text: "EBI" } : null;
            })
        ),
    };
}

function getEmdb<T extends Data.Emdb>(emdb: T): Emdb {
    return {
        ...emdb,
        imageUrl:
            emdb.imageLink?.[0] ||
            `https://www.ebi.ac.uk/pdbe/static/entry/EMD-${emdb.id}/400_${emdb.id}.gif`,
        externalLinks: _.compact(
            emdb.externalLink.map(externalLink => {
                return externalLink.includes("www.ebi") ? { url: externalLink, text: "EBI" } : null;
            })
        ),
    };
}

function withPluralNames<T extends { name: string[] }>(value: T): UseNamesField<T> {
    const { name, ...other } = value;
    return { ...other, names: name };
}

type UseNamesField<T> = Omit<T, "name"> & { names: string[] };
