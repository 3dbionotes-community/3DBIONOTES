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

export interface ComputationalModel {
    source: "SWISS-MODEL" | "BSM-Arc";
    model: string;
    externalLink: Url;
    queryLink: Url;
    project?: string;
    imageLink?: Url;
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

export interface Pdb extends DbItem {
    validation?: Maybe<{
        "pdb-redo": Validation;
        isolde: Validation;
    }>;
}

export interface Emdb extends DbItem {
    validation?: Maybe<string[]>;
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
