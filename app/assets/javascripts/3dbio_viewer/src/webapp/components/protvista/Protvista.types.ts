import React from "react";
import _ from "lodash";
import { Pdb } from "../../../domain/entities/Pdb";
import { TrackDefinition } from "../../../domain/entities/TrackDefinition";
import { PdbView } from "../../view-models/PdbView";
import { SelectionState } from "../../view-models/SelectionState";
import { ViewerBlockModel } from "../ViewerBlock";
import { Profile, profiles } from "./protvista-blocks";

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
    profiles: Profile[];
}

export interface ProtvistaBlock extends ViewerBlockModel {
    tracks: TrackDef[];
    component?: React.FC<BlockComponentProps>;
}

export function getVisibleBlocks(
    blocks: BlockDef[],
    options: { pdb: Pdb; profile: Profile }
): BlockDef[] {
    const { pdb, profile } = options;

    return blocks
        .filter(block => blockHasRelevantData(block, pdb))
        .filter(block => profile === profiles.general || block.profiles.includes(profile));
}

function blockHasRelevantData(block: BlockDef, pdb: Pdb): boolean {
    const tracks = _(pdb.tracks)
        .keyBy(track => track.id)
        .at(...block.tracks.map(trackDef => trackDef.id))
        .compact()
        .value();
    const trackIds = tracks.map(track => track.id);
    const hasCustomComponent = Boolean(block.component);
    const hasRelevantTracks = !_(tracks).isEmpty() && !_.isEqual(trackIds, ["structure-coverage"]);

    return hasCustomComponent || hasRelevantTracks;
}
