import { Emdb } from "../../../domain/entities/Pdb";

export type PdbEmdbMapping = Record<PdbId, EmdbId[]>;

type PdbId = string;
type EmdbId = string;

export function getEmdbsFromPdbEmdbMapping(pdbEmdbMapping: PdbEmdbMapping, pdbId: string): Emdb[] {
    const emdbIds = pdbEmdbMapping[pdbId.toLowerCase()];
    return emdbIds ? emdbIds.map(emdbId => ({ id: emdbId })) : [];
}
