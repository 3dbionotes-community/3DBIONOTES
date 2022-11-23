import { Future } from "../../utils/future";
import { PdbLigand } from "../entities/Pdb";
import { PdbOptions, PdbRepository } from "../repositories/PdbRepository";

export class GetPdbUseCase {
    constructor(private pdbRepository: PdbRepository) {}

    execute(options: PdbOptions) {
        const pdb$ = this.pdbRepository.get(options);
        return pdb$.flatMap(pdb => {
            if (!pdb.ligands) return Future.success(pdb);
            return Future.parallel(
                pdb.ligands.map(ligand =>
                    this.pdbRepository
                        .getIDR(ligand.inChI)
                        .map((idr): PdbLigand => ({ ...ligand, imageDataResource: idr }))
                )
            ).map(ligands => ({ ...pdb, ligands }));
        });
    }
}
