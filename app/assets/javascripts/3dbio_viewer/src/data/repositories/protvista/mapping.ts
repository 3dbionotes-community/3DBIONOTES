import { EmdbId, PdbId } from "../../../domain/entities/Pdb";

export type PdbEmdbMapping = Record<PdbId, EmdbId[]>;
export type EmdbPdbMapping = Record<EmdbId, PdbId[]>;

export function getEmdbsFromMapping(pdbEmdbMapping: PdbEmdbMapping, pdbId: string): EmdbId[] {
    return pdbEmdbMapping[pdbId.toLowerCase()] || [];
}

export function getPdbsFromMapping(emdbPdbMapping: EmdbPdbMapping, emdbId: string): EmdbId[] {
    return emdbPdbMapping[emdbId.toUpperCase()] || [];
}
