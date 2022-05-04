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

export type W3Color =
    | "w3-cyan"
    | "w3-turq"
    | "w3-turq"
    | "w3-amber"
    | "w3-aqua"
    | "w3-blue"
    | "w3-light-blue"
    | "w3-brown"
    | "w3-cyan"
    | "w3-blue-grey"
    | "w3-green"
    | "w3-light-green"
    | "w3-indigo"
    | "w3-khaki"
    | "w3-lime"
    | "w3-orange"
    | "w3-deep-orange"
    | "w3-pink"
    | "w3-purple"
    | "w3-deep-purple"
    | "w3-red"
    | "w3-sand"
    | "w3-teal"
    | "w3-yellow"
    | "w3-white"
    | "w3-black"
    | "w3-grey"
    | "w3-light-grey"
    | "w3-dark-grey"
    | "w3-pale-red"
    | "w3-pale-green"
    | "w3-pale-yellow"
    | "w3-pale-blue";

export interface PdbValidation {
    type: "pdbRedo" | "isolde" | "refmac";
    externalLink?: Url;
    queryLink?: Url;
    badgeColor: W3Color;
}

export type EmdbValidation = "DeepRes" | "MonoRes" | "BlocRes" | "Map-Q" | "FSC-Q";

export interface Pdb extends DbItem {
    keywords: string;
    entities: Entity[];
    ligands: string[];
}

export interface Emdb extends DbItem {
    emMethod: string;
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
    sample?: Sample;
    refdoc?: RefDoc[];
}

export const filterKeys = [
    "antibodies",
    "nanobodies",
    "sybodies",
    "pdbRedo",
    "isolde",
    "refmac",
] as const;

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

export function filterPdbValidations(
    pdbValidations: PdbValidation[],
    filterState: Covid19Filter
): boolean {
    return (
        (!filterState.pdbRedo || _.some(pdbValidations, v => v?.type === "pdbRedo")) &&
        (!filterState.isolde || _.some(pdbValidations, v => v?.type === "isolde")) &&
        (!filterState.refmac || _.some(pdbValidations, v => v?.type === "refmac"))
    );
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
            pdbRedo: i18n.t("PDB-Redo"),
            isolde: i18n.t("Isolde"),
            refmac: i18n.t("Refmac"),
        } as Record<FilterKey, string>,
    };
}
