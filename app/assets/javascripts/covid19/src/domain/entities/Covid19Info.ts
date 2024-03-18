import _ from "lodash";
import i18n from "../../utils/i18n";

export interface Covid19Info {
    count: number;
    structures: Structure[];
    validationSources: ValidationSource[];
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
    validations: Validations;
    queryLink: Url;
}

export interface Organism {
    id: Id;
    name: string;
    commonName?: string;
    externalLink: Url;
}

export interface Entity {
    uniprotAcc: string | null;
    name: string;
    organism: string | null;
    details?: string;
    altNames: string;
    isAntibody: boolean;
    isNanobody: boolean;
    isSybody: boolean;
}

export interface Ligand {
    id: Id;
    name: string;
    details: string;
    imageLink: Url;
    externalLink: Url;
    inChI: string; //IUPACInChIkey
    hasIDR: boolean;
}

export interface LigandInstance {
    info: Ligand;
    instances: number;
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

export interface ValidationSource {
    name: SourceName;
    description: string;
    externalLink: string;
    methods: ValidationMethod[];
}

export interface ValidationMethod {
    name: MethodName;
    description: string;
    externalLink: string;
}

export interface Validation {
    externalLink?: Url;
    queryLink?: Url;
    badgeColor: W3Color;
}

export interface PdbValidation extends Validation {
    source: PdbSourceName;
    method: PdbMethodName;
}

export interface EmdbValidation extends Validation {
    source: EmdbSourceName;
    method: EmdbMethodName;
}

export interface Validations {
    pdb: PdbValidation[];
    emdb: EmdbValidation[];
}

export type SourceName = PdbSourceName | EmdbSourceName | "IDR";

export type MethodName = PdbMethodName | EmdbMethodName | "IDR";

export type PdbSourceName = "PDB-REDO" | "CSTF" | "CERES";

export type PdbMethodName = "PDB-Redo" | "Isolde" | "Refmac" | "PHENIX";

export type EmdbSourceName = "";

export type EmdbMethodName = "DeepRes" | "MonoRes" | "BlocRes" | "Map-Q" | "FSC-Q";

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

export interface RefDoc {
    id: Id;
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
    "cstf",
    "ceres",
    "idr",
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

export function filterLigands(ligands: Ligand[]): Ligand[] {
    return ligands.filter(ligand => ligand.hasIDR);
}

export function filterPdbValidations(
    PdbValidations: PdbValidation[],
    filterState: Covid19Filter
): boolean {
    return (
        (!filterState.pdbRedo || _.some(PdbValidations, v => v?.source === "PDB-REDO")) &&
        (!filterState.cstf || _.some(PdbValidations, v => v?.source === "CSTF")) &&
        (!filterState.ceres || _.some(PdbValidations, v => v?.source === "CERES"))
    );
}

export function getTranslations() {
    return {
        filterKeys: {
            antibodies: i18n.t("Antibodies"),
            nanobodies: i18n.t("Nanobodies"),
            sybodies: i18n.t("Sybodies"),
            pdbRedo: i18n.t("PDB-REDO"),
            cstf: i18n.t("CSTF"),
            ceres: i18n.t("CERES"),
            idr: i18n.t("IDR"),
        } as Record<FilterKey, string>,
    };
}

export function getValidationSource(
    validationSources: ValidationSource[],
    source: SourceName
): Maybe<ValidationSource> {
    return validationSources.find(s => s.name === source);
}
