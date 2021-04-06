export interface AtomicStructure {
    chains: Chains;
}

export type Chains = Record<string, ChainObject[]>;

export interface ChainObject {
    id: string;
    chainName: string;
    name: string;
    org: string;
    evalue: string;
    cov: string;
    start: string;
    end: string;
    db: string;
}
