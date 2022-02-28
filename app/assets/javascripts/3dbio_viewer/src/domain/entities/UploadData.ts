import { Annotations } from "./Annotation";

export interface UploadData {
    title: string;
    chains: UploadDataChain[];
    annotations: Annotations;
}

export interface UploadDataChain {
    name: string;
    chain: string;
    uniprot: string; // protein
    uniprotLength: number;
    uniprotTitle: string;
    organism: string;
    gene_symbol: string;
    pdbPath?: string;
}
