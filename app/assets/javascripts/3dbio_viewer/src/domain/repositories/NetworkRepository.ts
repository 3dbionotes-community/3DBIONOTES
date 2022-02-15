import { Maybe } from "../../utils/ts-utils";
import { FutureData } from "../entities/FutureData";
import { Species } from "../entities/Species";

export interface NetworkRepository {
    build(definition: NetworkDefinition): FutureData<BuildResponse>;
}

export interface NetworkDefinition {
    species: Species;
    proteins: string;
    includeNeighboursWithStructuralData: boolean;
    annotationsFile: Maybe<File>;
}

export interface BuildResponse {}
