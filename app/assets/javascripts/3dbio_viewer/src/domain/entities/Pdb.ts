import _ from "lodash";
import { Maybe } from "../../utils/ts-utils";
import { Annotations, getTracksFromAnnotations } from "./Annotation";
import { Color } from "./Color";
import { Experiment } from "./Experiment";
import { LigandImageData } from "./LigandImageData";
import { Link } from "./Link";
import { Protein } from "./Protein";
import { ProteinNetwork } from "./ProteinNetwork";
import { Track } from "./Track";
import { Variants } from "./Variant";

export interface Pdb {
    id: Maybe<PdbId>;
    title: Maybe<string>;
    experiment: Maybe<Experiment>;
    emdbs: Emdb[];
    protein: Maybe<Protein>;
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
    proteinNetwork: Maybe<ProteinNetwork>;
    file: Maybe<string>;
    path: Maybe<string>;
    customAnnotations: Maybe<Annotations>;
    ligands: Maybe<PdbLigand[]>;
    publications: PdbPublication[];
    organism: Maybe<string>;
}

export interface PdbLigand {
    name: string;
    inChI: string; //IUPACInChIkey
    imageDataResource: Maybe<LigandImageData>;
    smiles: Maybe<string>;
    formula: Maybe<string>;
    pubchemId: Maybe<string>;
}

export type PdbId = string;

export interface Emdb {
    id: EmdbId;
    emv?: EMValidations;
}

export type EmdbId = string;

export interface StatsValidation {
    unit: "Angstrom";
    rank: number;
    resolutionMedian: number;
    quartile25: number;
    quartile75: number;
    warnings?: string[];
    errors?: string[];
}

export interface EMValidations {
    stats: Maybe<StatsValidation>;
    // deepres: {};
    // monores: {};
    // blocres: {};
    // mapq: {};
    // fscq: {};
    // daq: {};
}

export interface PdbPublication {
    title: string;
    type: string;
    doi?: string;
    doiUrl?: string;
    pubmedId?: string;
    pubmedUrl?: string;
    relatedEntries: PdbId[];
    journalInfo: {
        pdbAbbreviation?: string;
        isoAbbreviation?: string;
        pages?: string;
        volume?: string;
        issue?: string;
        year?: number;
    };
    abstract: {
        unassigned?: string;
    };
    authors: string[];
}

type PdbEntity = "pdb" | "emdb";

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
    }
}

export function addCustomAnnotationsToPdb(pdb: Pdb, annotations: Annotations): Pdb {
    const newTracks = getTracksFromAnnotations(annotations);
    const tracksUpdated = _.concat(pdb.tracks, newTracks);
    return { ...pdb, tracks: tracksUpdated, customAnnotations: annotations };
}

export function addProteinNetworkToPdb(pdb: Pdb, proteinNetwork: Maybe<ProteinNetwork>): Pdb {
    const customAnnotations = proteinNetwork?.uploadData.annotations;
    return { ...pdb, proteinNetwork, customAnnotations };
}
