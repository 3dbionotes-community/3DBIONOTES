import { EmdbId, PdbId } from "../../domain/entities/Pdb";
import { routes } from "../../routes";

export type PdbEmdbMapping = Record<PdbId, EmdbId[]>;
export type EmdbPdbMapping = Record<EmdbId, PdbId[]>;

export const emdbsFromPdbUrl = `${routes.bionotes}/api/mappings/PDB/EMDB`;
export const pdbsFromEmdbUrl = `${routes.bionotes}/api/mappings/EMDB/PDB`;

export function getEmdbsFromMapping(pdbEmdbMapping: PdbEmdbMapping, pdbId: string): EmdbId[] {
    return pdbEmdbMapping[pdbId.toLowerCase()] || [];
}

export function getPdbsFromMapping(emdbPdbMapping: EmdbPdbMapping, emdbId: string): EmdbId[] {
    return emdbPdbMapping[emdbId.toUpperCase()] || [];
}
