export interface Covid19Info {
    structures: Structure[];
}

export interface Organism {
    id: string;
    name: string;
    externalLink: Url;
}

export interface Entity {
    id: string;
    names: string[];
    description: Url;
    externalLink: Url;
}

export interface Ligand {
    id: string;
    names: string[];
    imageLink?: Url;
    externalLink?: Url;
    type?: string;
    InnChIKey?: string;
    components?: string[];
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
    computationalModel: Maybe<ComputationalModel>;
    ligands: LigandInstance[];
    details: Maybe<string>;
}

export type ComputationalModel =
    | SwissComputationalModel
    | BSMArcComputationalModel
    | AlphaFoldComputationalModel;

export interface SwissComputationalModel {
    source: "SWISS-MODEL";
    // TODO: id: project-model
    project: string;
    model: string;
    externalLink: Url;
    queryLink: Url;
    imageLink?: Url;
}

export interface BSMArcComputationalModel {
    source: "BSM-Arc";
    model: string;
    externalLink: Url;
    queryLink: Url;
}

export interface AlphaFoldComputationalModel {
    source: "AlphaFold";
    model: string;
    externalLink: Url;
    queryLink: Url;
}

export interface DbItem {
    id: Id;
    method?: string;
    resolution?: string;
    imageUrl: Url;
    externalLinks: Link[];
    queryLink: Url[];
}

export interface Link {
    text: string;
    url: string;
    tooltip?: string;
}

export interface PdbRedoValidation {
    type: "pdbRedo";
    externalLink: Url;
    queryLink: Url;
    badgeColor: W3Color;
}

export interface IsoldeValidation {
    type: "isolde";
    queryLink: Url;
    badgeColor: W3Color;
}

export type W3Color = "w3-cyan" | "w3-turq";

export type PdbValidation = PdbRedoValidation | IsoldeValidation;

export interface Pdb extends DbItem {
    validations: PdbValidation[];
}

export interface Emdb extends DbItem {
    validations: string[];
}

export interface Validation {
    externalLink?: Url[];
    queryLink: Url[];
    badgeColor: string;
}

export type Id = string;

export type Dictionary<T> = Record<Id, T>;

type Maybe<T> = T | undefined | null;

export type Url = string;

export type Ref = { id: Id };
