import { W3Color } from "../domain/entities/Covid19Info";

export interface Covid19Data {
    Organisms: Organism[];
    Entities: Entity[];
    Ligands: Ligand[];
    Structures: Structure[];
}

export interface Organism {
    ncbi_taxonomy_id: string;
    common_name?: string;
    scientific_name: string;
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
    dbId: LigandId;
    name: string;
    details: string;
    imageLink: Url;
    externalLink: Url;
}

export interface Structure {
    title: string;
    pdb: Pdb;
    emdb: Emdb;
    compModel?: Maybe<ComputationalModel>;
}

export type ComputationalModel =
    | SwissComputationalModel
    | BSMArcComputationalModel
    | AlphaFoldComputationalModel;

export interface SwissComputationalModel {
    source: "SWISS-MODEL";
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
    dbId: string;
    method?: string;
    resolution?: string;
    imageLink?: Url;
    externalLink: Url;
    queryLink: Url;
}

export interface Pdb extends DbItem {
    keywords: string;
    entities: Entity[];
    ligands: LigandId[];
    validation?: Partial<{
        "pdb-redo": Validation;
        isolde: Omit<Validation, "externalLink">;
    }>;
}

export interface Emdb extends DbItem {
    emMethod: string;
    validation?: EmdbValidation[];
}

type Maybe<T> = T | null;

type LigandId = string;

export type EntityRef = { organism?: string; uniprotAcc?: string };

type EmdbValidation = "DeepRes" | "MonoRes" | "Map-Q" | "FSC-Q";

export interface Validation {
    externalLink: Url;
    queryLink: Url;
    badgeColor: W3Color;
}

export type Url = string;
