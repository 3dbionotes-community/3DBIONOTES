import { ChainId } from "./Protein";

export interface AtomicStructure {
    token: string;
    tracks: Tracks;
    mapping: Mapping;
}

export type Tracks = Record<string, ChainObject[]>;

export interface ChainObject {
    id: string;
    acc: string;
    chain: string;
    name: string;
    org: string;
    evalue: string;
    cov: string;
    start: string;
    end: string;
    db: string;
    gene: string;
}

export interface AtomicStructureMapping {
    token: string;
    mapping: Mapping;
    chainObjects: ChainObject[];
}

export interface Mapping {
    n_models: number;
    sequences: Record<ChainId, string>;
    mapping: Record<ChainId, string[]>;
    no_aa_ch: object;
}
