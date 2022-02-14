import _ from "lodash";
import { Maybe } from "../../utils/ts-utils";
import { BlockDef } from "../../webapp/components/protvista/Protvista.types";
import { Annotations, getTracksFromAnnotations } from "./Annotation";
import { Color } from "./Color";
import { Experiment } from "./Experiment";
import { Link } from "./Link";
import { Protein } from "./Protein";
import { Track } from "./Track";
import { Variants } from "./Variant";

export interface Pdb {
    id: Maybe<PdbId>;
    experiment: Maybe<Experiment>;
    emdbs: Emdb[];
    protein: Protein;
    chainId: string;
    sequence: string;
    length: number;
    // https://github.com/ebi-webcomponents/nightingale/tree/master/packages/protvista-track#data-array
    tracks: Track[];
    variants?: Variants;
    sequenceConservation?: unknown;
    legends?: {
        alignment: "left" | "right" | "center";
        data: Record<string, Array<{ color: Color[]; text: string }>>;
    };
}

export type PdbId = string;

export interface Emdb {
    id: EmdbId;
}

export type EmdbId = string;

type PdbEntity = "pdb" | "emdb" | "uniprot";

export function getEntityLinks(pdb: Pdb, entity: PdbEntity): Link[] {
    switch (entity) {
        case "pdb": {
            if (!pdb.id) return [];
            const pdbId = pdb.id.toUpperCase();
            return [{ name: pdbId, url: `https://www.ebi.ac.uk/pdbe/entry/pdb/${pdbId}` }];
        }
        case "emdb": {
            return pdb.emdbs.map(emdb => ({
                name: emdb.id,
                url: `https://www.ebi.ac.uk/pdbe/entry/emdb/${emdb.id}`,
            }));
        }
        case "uniprot": {
            const proteinId = pdb.protein.id.toUpperCase();
            return [{ name: proteinId, url: `https://www.uniprot.org/uniprot/${proteinId}` }];
        }
    }
}

export function addCustomAnnotationsToPdb(pdb: Pdb, annotations: Annotations): Pdb {
    const newTracks = getTracksFromAnnotations(annotations);
    const tracksUpdated = _.concat(pdb.tracks, newTracks);
    return { ...pdb, tracks: tracksUpdated };
}

export function pdbHasCustomTracks(block: BlockDef, pdb: Pdb): boolean {
    return block.hasUploadedTracks ? pdb.tracks.some(track => track.isCustom) : false;
}

export function getCustomTracksFromPdb(block: BlockDef, pdb: Pdb): Track[] {
    return block.hasUploadedTracks ? pdb.tracks.filter(track => track.isCustom) : [];
}
