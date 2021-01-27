import { FutureData } from "../entities/FutureData";
import { Pdb } from "../entities/Pdb";

export interface PdbRepository {
    get(options: PdbOptions): FutureData<Pdb>;
}

export interface PdbOptions {
    protein: string;
    pdb: string;
    chain: string;
}
