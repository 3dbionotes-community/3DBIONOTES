export type PdbExperiment = Record<string, ExperimentInfo[]>;

interface ExperimentInfo {
    resolution: number;
}

interface Experiment {
    resolution: number;
}

export function getExperiment(pdbId: string, pdbExperiment: PdbExperiment): Experiment | undefined {
    const info = pdbExperiment[pdbId]?.[0];
    if (!info) return;

    return { resolution: info.resolution };
}
