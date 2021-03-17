import { Shape } from "./Shape";

export interface TrackDefinition {
    id: string;
    name: string;
    description?: string;
    subtracks: SubtrackDef[];
    //component?: React.FC<TrackComponentProps>;
}

interface SubtrackDef {
    id: string;
    name: string;
    source: string;
    description?: string;
    color: string;
    shape: Shape;
}
