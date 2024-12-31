export interface Covid19Data {
    Organisms: Organism[];
    Ligands: Ligand[];
    Structures: Array<Structure[]>;
    RefModelSources: RefModelSource[];
    RefModelMethods: RefModelMethod[];
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
    organism: Maybe<string>;
    details?: string;
    altNames: string;
    isAntibody: boolean;
    isNanobody: boolean;
    isSybody: boolean;
    seq_align_begin: number | undefined;
    seq_align_end: number | undefined;
    xRef: { xDB: string; xDB_code: string }[] | undefined;
}

export interface Ligand {
    IUPACInChIkey: IUPACInChIkey;
    pubChemCompoundId: string;
    dbId: LigandId;
    name: string;
    details: string;
    imageLink: Url;
    externalLink: Url;
    xRef?: XRef;
}

export interface Structure {
    title: string;
    pdb: Maybe<Pdb>;
    emdb: Maybe<Emdb>;
}

export interface RefModelSource {
    name: SourceName;
    description: string;
    externalLink: string;
}

export interface RefModelMethod {
    source: SourceName;
    name: MethodName;
    description: string;
    externalLink: string;
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
    ligands: IUPACInChIkey[];
    details: Details[];
    dbauthors?: string[];
    refModels: RefModel[];
}

export interface Emdb extends DbItem {
    emMethod: string;
}

export type SourceName = PdbSourceName | "IDR";

export type PdbSourceName = "PDB-REDO" | "CSTF" | "CERES";

export type MethodName = PdbMethodName | "IDR";

export type PdbMethodName = "PDB-Redo" | "Isolde" | "Refmac" | "PHENIX";

type XRef = ["IDR"];

type Maybe<T> = T | null;

type LigandId = string;
type IUPACInChIkey = string;

export type EntityRef = { organism?: string; uniprotAcc?: string };

export type Url = string;

export interface RefDB {
    title: string;
    authors: string[];
    deposited?: string;
    released?: string;
}

export interface RefDoc {
    pmID: string;
    title: string;
    authors: string[];
    journal: string;
    pubDate: string;
    pmidLink?: Url;
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
    sample: Sample;
    refdoc: RefDoc[];
}

export interface RefModel {
    source: PdbSourceName;
    method: PdbMethodName;
    filename: string;
    externalLink?: Url;
    queryLink?: Url;
    details: string;
}
