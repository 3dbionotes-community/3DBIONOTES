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

export interface ComputationalModel {
    source: "SWISS-MODEL" | "BSM-Arc";
    model: string;
    externalLink: [Url];
    queryLink: [Url];
    project?: string;
    imageLink?: [Url];
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
    validation?: Maybe<{
        "pdb-redo": Validation;
        isolde: Validation;
    }>;
}

export interface Emdb extends DbItem {
    validation?: string[];
}

export interface Validation {
    externalLink?: Url[];
    queryLink: Url[];
    badgeColor: string;
}

export type Url = string;
