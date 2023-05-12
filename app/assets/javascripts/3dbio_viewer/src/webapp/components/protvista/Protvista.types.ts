import React from "react";
import _ from "lodash";
import { Pdb } from "../../../domain/entities/Pdb";
import { TrackDefinition } from "../../../domain/entities/TrackDefinition";
import { PdbView } from "../../view-models/PdbView";
import { Selection } from "../../view-models/Selection";
import { ViewerBlockModel } from "../ViewerBlock";
import { Profile } from "../../../domain/entities/Profile";

export interface ProtvistaTrackElement extends HTMLDivElement {
    viewerdata: PdbView;
    layoutHelper: {
        hideSubtracks(index: number): void;
    };
}

export interface BlockComponentProps {
    pdb: Pdb;
    selection: Selection;
    block: BlockDef;
    setBlockVisibility?: (blockVisibility: BlockVisibility) => void;
}

export type TrackDef = TrackDefinition;

export interface TrackComponentProps extends BlockComponentProps {
    trackDef: TrackDef;
}

export interface BlockDef extends ViewerBlockModel {
    tracks: TrackDef[];
    component?: React.FC<BlockComponentProps>;
    profiles: Profile[];
    hasUploadedTracks?: boolean;
}

export interface ProtvistaBlock extends ViewerBlockModel {
    tracks: TrackDef[];
    component?: React.FC<BlockComponentProps>;
}

export interface BlockVisibility {
    block: BlockDef;
    visible: boolean;
}
