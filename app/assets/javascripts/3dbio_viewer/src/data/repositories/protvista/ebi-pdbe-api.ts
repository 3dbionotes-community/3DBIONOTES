import { Experiment } from "../../../domain/entities/Experiment";

export type PdbExperiment = Record<string, ExperimentInfo[]>;

interface ExperimentInfo {
    resolution: number;
    experimental_method: string;
}

export function getExperiment(pdbId: string, pdbExperiment: PdbExperiment): Experiment | undefined {
    const info = pdbExperiment[pdbId]?.[0];
    if (!info) return;

    return {
        resolution: info.resolution,
        method: info.experimental_method,
    };
}
