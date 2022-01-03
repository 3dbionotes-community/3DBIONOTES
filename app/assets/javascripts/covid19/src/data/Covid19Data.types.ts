export interface Covid19Data {
    Organisms: Organism[];
    Ligands: Ligand[];
    Structures: Array<Structure[]>;
}

export interface Organism {
    ncbi_taxonomy_id: string;
    common_name?: string;
    scientific_name: string;
    externalLink: Url;
}

export interface Entity {
    uniprotAcc: Maybe<string>;
    name: string;
    organism: string;
    details: string;
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
    pdb: Maybe<Pdb>;
    emdb: Maybe<Emdb>;
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
}

export interface Emdb extends DbItem {
    emMethod: string;
}

type Maybe<T> = T | null;

type LigandId = string;

export type EntityRef = { organism?: string; uniprotAcc?: string };

export type Url = string;
