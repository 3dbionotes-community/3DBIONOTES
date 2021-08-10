import { W3Color } from "../domain/entities/Covid19Info";

export interface Covid19Data {
    Organisms: Dictionary<Maybe<Organism>>;
    Entities: Dictionary<Maybe<Entity>>;
    Ligands: Dictionary<Ligand>;
    Structures: Structure[];
}

type Id = string;

type Maybe<T> = T | null;

type Dictionary<T> = Record<Id, T>;

export interface Organism {
    name: string;
    externalLink: Url;
}

export interface Entity {
    name: string[];
    description: Url;
    externalLink: Url;
}

export interface Ligand {
    name: string[];
    InnChIKey?: string;
    imageLink?: Url[];
    externalLink?: Url[];
    type?: string;
    components?: string[];
}

export interface Structure {
    title?: string[];
    entity: Id[];
    pdb: Maybe<Pdb>;
    emdb: Maybe<Emdb>;
    compModel: Maybe<ComputationalModel>;
    organism: Id[];
    ligand?: LigandRef[];
}

export type LigandRef = Dictionary<{ instances: number }>;

export type ComputationalModel =
    | SwissComputationalModel
    | BSMArcComputationalModel
    | AlphaFoldComputationalModel;

export interface SwissComputationalModel {
    source: "SWISS-MODEL";
    project: string;
    model: string;
    externalLink: [Url];
    queryLink: [Url];
    imageLink?: [Url];
}

export interface BSMArcComputationalModel {
    source: "BSM-Arc";
    model: string;
    externalLink: [Url];
    queryLink: [Url];
}

export interface AlphaFoldComputationalModel {
    source: "AlphaFold";
    model: string;
    externalLink: [Url];
    queryLink: [Url];
}

export interface DbItem {
    id: Id;
    method?: string;
    resolution?: string;
    imageLink?: Url[];
    externalLink: Url[];
    queryLink: Url[];
}

export interface Pdb extends DbItem {
    validation?: Partial<{
        "pdb-redo": Validation;
        isolde: Omit<Validation, "externalLink">;
    }>;
}

export interface Emdb extends DbItem {
    validation?: EmdbValidation[];
}

type EmdbValidation = "DeepRes" | "MonoRes" | "Map-Q" | "FSC-Q";

export interface Validation {
    externalLink: Url[];
    queryLink: Url[];
    badgeColor: W3Color;
}

export type Url = string;
