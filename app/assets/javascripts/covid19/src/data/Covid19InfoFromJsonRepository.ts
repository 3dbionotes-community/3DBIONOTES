import _ from "lodash";
import {
    ComputationalModel,
    Covid19Info,
    Emdb,
    Entity,
    LigandInstance,
    Organism,
    Pdb,
    PdbRedoValidation,
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
                title: (structure.title || []).join(", "),
                id: getStructureId(structure),
                pdb: structure.pdb ? getPdb(structure.pdb) : undefined,
                emdb: structure.emdb ? getEmdb(structure.emdb) : undefined,
                computationalModel: getComputationModel(structure.compModel),
                entities: getEntities(data.Entities, structure.entity),
                ligands: getLigands(data.Ligands, structure.ligand),
                organisms: getOrganisms(data.Organisms, structure.organism),
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
    const parts = [
        structure.pdb?.id,
        structure.emdb?.id,
        ...structure.entity,
        ...structure.organism,
    ];
    return _(parts).compact().join("-");
}

function getComputationModel(
    dataCompModel: Data.ComputationalModel | null
): ComputationalModel | undefined {
    if (!dataCompModel) return undefined;

    switch (dataCompModel.source) {
        case "SWISS-MODEL":
            return {
                ...dataCompModel,
                externalLink: dataCompModel.externalLink[0],
                queryLink: dataCompModel.queryLink[0],
                imageLink: dataCompModel.imageLink?.[0],
            };
        case "BSM-Arc":
        case "AlphaFold":
            return {
                ...dataCompModel,
                externalLink: dataCompModel.externalLink[0],
                queryLink: dataCompModel.queryLink[0],
            };
    }
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
    const pdbE: Pdb = {
        ..._.omit(pdb, ["imageLink", "externalLink", "validation"]),
        validations: getPdbValidations(pdb.validation),
        imageUrl:
            pdb.imageLink?.[0] ||
            `https://www.ebi.ac.uk/pdbe/static/entry/${pdb.id}_deposited_chain_front_image-200x200.png`,
        externalLinks: _.compact(
            pdb.externalLink.map(externalLink => {
                return externalLink.includes("www.ebi") ? { url: externalLink, text: "EBI" } : null;
            })
        ),
    };
    return pdbE;
}

function getPdbValidations(dataValidations: Data.Pdb["validation"]): Pdb["validations"] {
    const { "pdb-redo": pdbRedo, isolde } = dataValidations || {};

    return _.compact([
        pdbRedo
            ? ({
                  type: "pdbRedo",
                  badgeColor: pdbRedo.badgeColor,
                  externalLink: pdbRedo["externalLink"][0],
                  queryLink: pdbRedo["queryLink"][0],
              } as PdbRedoValidation)
            : null,
        isolde
            ? {
                  type: "isolde",
                  badgeColor: isolde.badgeColor,
                  queryLink: isolde["queryLink"][0],
              }
            : null,
    ]);
}

function getEmdb<T extends Data.Emdb>(emdb: T): Emdb {
    const emdbE: Emdb = {
        ..._.omit(emdb, ["imageLink", "externalLink", "validation"]),
        validations: emdb.validation || [],
        imageUrl:
            emdb.imageLink?.[0] ||
            `https://www.ebi.ac.uk/pdbe/static/entry/EMD-${emdb.id}/400_${emdb.id}.gif`,
        externalLinks: _.compact(
            emdb.externalLink.map(externalLink => {
                return externalLink.includes("www.ebi") ? { url: externalLink, text: "EBI" } : null;
            })
        ),
    };
    return emdbE;
}

function withPluralNames<T extends { name: string[] }>(value: T): UseNamesField<T> {
    const { name, ...other } = value;
    return { ...other, names: name };
}

type UseNamesField<T> = Omit<T, "name"> & { names: string[] };
