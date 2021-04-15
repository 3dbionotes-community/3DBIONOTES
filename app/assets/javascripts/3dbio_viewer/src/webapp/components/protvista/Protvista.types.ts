import React from "react";
import { Pdb } from "../../../domain/entities/Pdb";
import { TrackDefinition } from "../../../domain/entities/TrackDefinition";
import { PdbView } from "../../view-models/PdbView";
import { SelectionState } from "../../view-models/SelectionState";
import { ViewerBlockModel } from "../ViewerBlock";

export interface ProtvistaTrackElement extends HTMLDivElement {
    viewerdata: PdbView;
    layoutHelper: {
        hideSubtracks(index: number): void;
    };
}

export interface BlockComponentProps {
    pdb: Pdb;
    selection: SelectionState;
}

export type TrackDef = TrackDefinition;

export interface TrackComponentProps extends BlockComponentProps {
    trackDef: TrackDef;
}

export interface BlockDef extends ViewerBlockModel {
    tracks: TrackDef[];
    component?: React.FC<BlockComponentProps>;
}

export interface ProtvistaBlock extends ViewerBlockModel {
    tracks: TrackDef[];
    component?: React.FC<BlockComponentProps>;
}


