import _ from "lodash";
import i18n from "../../utils/i18n";

export interface Covid19Info {
    structures: Structure[];
}

export interface Organism {
    id: string;
    name: string;
    commonName?: string;
    externalLink: Url;
}

export interface Entity {
    uniprotAcc: string | null;
    name: string;
    organism: string;
    details?: string;
    altNames: string;
    isAntibody: boolean;
    isNanobody: boolean;
    isSybody: boolean;
}

export interface Ligand {
    id: string;
    name: string;
    details: string;
    imageLink: Url;
    externalLink: Url;
}

export interface LigandInstance {
    info: Ligand;
    instances: number;
}

export interface Structure {
    id: Id;
    title: string;
    entities: Entity[];
    pdb: Maybe<Pdb>;
    emdb: Maybe<Emdb>;
    organisms: Organism[];
    ligands: Ligand[];
    details: Maybe<Details>;
    validations: {
        pdb: PdbValidation[];
        emdb: EmdbValidation[];
    };
}

export interface PdbRedoValidation {
    type: "pdbRedo";
    externalLink: Url;
    queryLink?: Url;
    badgeColor: W3Color;
}

export interface IsoldeValidation {
    type: "isolde";
    queryLink?: Url;
    badgeColor: W3Color;
}

export interface DbItem {
    id: Id;
    method?: string;
    resolution?: string;
    imageUrl: Url;
    externalLinks: Link[];
    queryLink: Url;
}

export interface Link {
    text: string;
    url: string;
    tooltip?: string;
}

export type W3Color = "w3-cyan" | "w3-turq";
export type PdbValidation = PdbRedoValidation | IsoldeValidation;
export type EmdbValidation = "DeepRes" | "MonoRes" | "BlocRes" | "Map-Q" | "FSC-Q";

export interface Pdb extends DbItem {
    keywords: string;
    entities: Entity[];
    ligands: string[];
}

export interface Emdb extends DbItem {
    emMethod: string;
}

export interface Validation {
    externalLink?: Url[];
    queryLink: Url[];
    badgeColor: string;
}

export type Id = string;

export type Dictionary<T> = Record<Id, T>;

export type Maybe<T> = T | undefined | null;

export type Url = string;

export type Ref = { id: Id };

export interface RefDB {
    title: string;
    authors: string[];
    deposited?: string;
    released?: string;
}

export interface RefEMDB extends RefDB {}

export interface RefPDB {}

export interface RefDoc {
    id: string;
    title: string;
    authors: string[];
    abstract?: string;
    journal: string;
    pubDate: string;
    idLink?: Url;
    doi?: Url;
}

export interface Sample {
    name: string;
    exprSystem?: string;
    assembly?: string;
    macromolecules?: string[];
    uniProts?: string[];
    genes?: string[];
    bioFunction?: string[];
    bioProcess?: string[];
    cellComponent?: string[];
    domains?: string[];
}

export interface Details {
    refEMDB?: RefEMDB;
    refPDB?: RefPDB;
    sample?: Sample;
    refdoc?: RefDoc[];
}

export const filterKeys = ["antibodies", "nanobodies", "sybodies", "pdbRedo"] as const;

export type FilterKey = typeof filterKeys[number];

export type Covid19Filter = Record<FilterKey, boolean>;

export function filterEntities(entities: Entity[], filterState: Covid19Filter): Entity[] {
    return entities.filter(
        entity =>
            entity.isAntibody === filterState.antibodies &&
            entity.isNanobody === filterState.nanobodies &&
            entity.isSybody === filterState.sybodies
    );
}

export function buildPdbRedoValidation(pdbId: Id): PdbRedoValidation {
    const pdbRedoUrl = `https://pdb-redo.eu/db/${pdbId.toLowerCase()}`;

    return {
        type: "pdbRedo",
        externalLink: pdbRedoUrl,
        queryLink: `/pdb_redo/${pdbId.toLowerCase()}`,
        badgeColor: "w3-turq",
    };
}

export function addPdbValidationToStructure(
    structure: Structure,
    validation: PdbValidation
): Structure {
    const existingValidations = structure.validations.pdb;
    const structureContainsValidation = _(existingValidations).some(existingValidation =>
        _.isEqual(existingValidation, validation)
    );

    if (!structureContainsValidation) {
        const pdbValidations = _.concat(existingValidations, [validation]);

        return {
            ...structure,
            validations: { ...structure.validations, pdb: pdbValidations },
        };
    } else {
        return structure;
    }
}

export function updateStructures(data: Covid19Info, structures: Structure[]): Covid19Info {
    if (_.isEmpty(structures)) return data;
    const structuresById = _.keyBy(structures, structure => structure.id);
    const structures2 = data.structures.map(structure => structuresById[structure.id] || structure);
    const hasChanges = _(data.structures)
        .zip(structures2)
        .some(([s1, s2]) => s1 !== s2);
    return hasChanges ? { structures: structures2 } : data;
}

export function getTranslations() {
    return {
        filterKeys: {
            antibodies: i18n.t("Antibodies"),
            nanobodies: i18n.t("Nanobodies"),
            sybodies: i18n.t("Sybodies"),
            pdbRedo: i18n.t("PDB-REDO"),
        } as Record<FilterKey, string>,
    };
}
