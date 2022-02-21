import { ProteinId } from "./Protein";
import { UploadData } from "./UploadData";

export interface ProteinNetwork {
    networkGraph: NetworkGraph;
    uploadData: UploadData;
    protein: ProteinId;
}

// JSON representation with nodes and edges (use internally only by PPI, no need to parse)
export type NetworkGraph = string;
