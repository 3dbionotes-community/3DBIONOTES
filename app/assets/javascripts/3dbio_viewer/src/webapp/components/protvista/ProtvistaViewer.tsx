import React from "react";

import { Pdb } from "../../../domain/entities/Pdb";
import { SelectionState } from "../../view-models/SelectionState";
import { ViewerBlock } from "../ViewerBlock";
import { blockDefs } from "./protvista-blocks";
import { ProtvistaPdb } from "./ProtvistaPdb";

import "./protvista-pdb.css";
import "./ProtvistaViewer.css";

export interface ProtvistaViewerProps {
    pdb: Pdb;
    selection: SelectionState;
}

export const ProtvistaViewer: React.FC<ProtvistaViewerProps> = props => {
    const { pdb, selection } = props;

    return (
        <div>
            {blockDefs.map(block => {
                const BlockComponent = block.component || ProtvistaPdb;
                const trackIds = block.tracks.map(track => track.id);

                return (
                    <ViewerBlock key={block.id} block={block}>
                        <BlockComponent pdb={pdb} selection={selection} trackIds={trackIds} />

                        {block.tracks.map((trackDef, idx) => {
                            const CustomTrackComponent = trackDef.component;
                            return (
                                CustomTrackComponent && (
                                    <CustomTrackComponent
                                        key={idx}
                                        trackDef={trackDef}
                                        pdb={pdb}
                                        selection={selection}
                                    />
                                )
                            );
                        })}
                    </ViewerBlock>
                );
            })}
        </div>
    );
};
