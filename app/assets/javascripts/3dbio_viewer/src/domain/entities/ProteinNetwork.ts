import { ProteinId } from "./Protein";
import { UploadData } from "./UploadData";

export interface ProteinNetwork {
    networkGraph: string; // JSON with nodes and edges (use internally by PPI, no need to parse)
    uploadData: UploadData;
    protein: ProteinId;
}
