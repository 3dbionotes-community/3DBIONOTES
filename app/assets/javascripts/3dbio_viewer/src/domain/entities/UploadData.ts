import { Track } from "./Track";

export interface UploadData {
    title: string;
    chains: UploadDataChain[];
    tracks: Track[];
}

export interface UploadDataChain {
    name: string;
    chain: string;
    uniprot: string; // protein
    uniprotLength: number;
    uniprotTitle: string;
    organism: string;
    gene_symbol: string;
}
