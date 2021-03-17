import { Shape } from "./Shape";

export interface TrackDefinition {
    id: string;
    name: string;
    description?: string;
    subtracks: SubtrackDefinition[];
}

export interface SubtrackDefinition {
    id: string;
    name: string;
    source: string;
    description?: string;
    color?: string;
    shape?: Shape;
}
