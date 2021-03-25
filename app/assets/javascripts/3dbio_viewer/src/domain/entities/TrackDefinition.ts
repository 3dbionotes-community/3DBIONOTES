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
    source?: string | { url: string; icon: string };
    description?: string;
    color?: string;
    shape?: Shape;
    dynamicSubtrack?: SubtrackDefinition;
}

export function getDynamicSubtrackId(subtrackDef: SubtrackDefinition, name: string) {
    return subtrackDef.id + "-" + name;
}
