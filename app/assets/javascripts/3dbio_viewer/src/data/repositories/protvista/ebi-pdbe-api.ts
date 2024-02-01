import { Experiment } from "../../../domain/entities/Experiment";

export type PdbExperiment = Record<string, ExperimentInfo[]>;
export type PdbMolecules = Record<string, MoleculeInfo[]>;

interface ExperimentInfo {
    resolution: number;
    experimental_method: string;
}

interface MoleculeInfo {
    source: { organism_scientific_name: string }[];
}

export function getExperiment(pdbId: string, pdbExperiment: PdbExperiment): Experiment | undefined {
    const info = pdbExperiment[pdbId]?.[0];
    if (!info) return;

    return {
        resolution: info.resolution,
        method: info.experimental_method,
    };
}

export function getFallbackOrganism(pdbId: string, pdbMolecules: PdbMolecules) {
    return pdbMolecules[pdbId]?.[0]?.source?.[0]?.organism_scientific_name;
}