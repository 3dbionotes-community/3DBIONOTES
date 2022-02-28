import { FutureData } from "../entities/FutureData";
import { Pdb, PdbId } from "../entities/Pdb";
import { ProteinId, ChainId } from "../entities/Protein";

export interface PdbRepository {
    get(options: PdbOptions): FutureData<Pdb>;
}

export interface PdbOptions {
    proteinId: ProteinId;
    pdbId: PdbId;
    chainId: ChainId;
}
