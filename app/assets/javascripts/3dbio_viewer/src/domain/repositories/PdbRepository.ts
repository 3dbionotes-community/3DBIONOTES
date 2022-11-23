import { Maybe } from "../../utils/ts-utils";
import { FutureData } from "../entities/FutureData";
import { LigandImageData } from "../entities/LigandImageData";
import { Pdb, PdbId } from "../entities/Pdb";
import { ProteinId, ChainId } from "../entities/Protein";

export interface PdbRepository {
    get(options: PdbOptions): FutureData<Pdb>;
    getIDR(inChIKey: string): FutureData<Maybe<LigandImageData>>;
}

export interface PdbOptions {
    proteinId: ProteinId;
    pdbId: Maybe<PdbId>;
    chainId: ChainId;
}
