import { Maybe } from "../../utils/ts-utils";
import { FutureData } from "../entities/FutureData";
import { Pdb, PdbId } from "../entities/Pdb";
import { ProteinId, ChainId } from "../entities/Protein";
import { IDROptions } from "../usecases/GetPdbUseCase";

export interface PdbRepository {
    get(options: PdbOptions, idrOptions: IDROptions): FutureData<Pdb>;
}

export interface PdbOptions {
    proteinId: Maybe<ProteinId>;
    pdbId: PdbId;
    chainId: ChainId;
    structAsymId: string;
}
