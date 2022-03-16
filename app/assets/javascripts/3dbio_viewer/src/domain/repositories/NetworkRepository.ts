import { Maybe } from "../../utils/ts-utils";
import { FutureData } from "../entities/FutureData";
import { ProteinNetwork } from "../entities/ProteinNetwork";
import { Species } from "../entities/Species";

export interface NetworkRepository {
    build(options: BuildNetworkOptions): FutureData<BuildNetworkResult>;
    get(options: { jobId: string }): FutureData<ProteinNetwork>;
}

export interface BuildNetworkOptions {
    network: NetworkDefinition;
    onProgress?: OnProgress;
}

export interface NetworkDefinition {
    species: Species;
    proteins: string;
    includeNeighboursWithStructuralData: boolean;
    annotationsFile: Maybe<File>;
}

export interface BuildNetworkResult {
    token: string;
}

type Percentage = number;

export interface BuildProgress {
    currentStep: number;
    totalSteps: number;
    value: Percentage;
}

export type OnProgress = (progress: BuildProgress) => void;
