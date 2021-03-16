import React from "react";

import { Pdb } from "../../../domain/entities/Pdb";
import { SelectionState } from "../../view-models/SelectionState";
import { ViewerBlock } from "../ViewerBlock";
import { ProtvistaPdb } from "./ProtvistaPdb";
import { BlockDef } from "./Protvista.types";

import "./protvista-pdb.css";
import "./ProtvistaViewer.css";

export interface ProtvistaViewerProps {
    pdb: Pdb;
    selection: SelectionState;
    blocks: BlockDef[];
}

export const ProtvistaViewer: React.FC<ProtvistaViewerProps> = props => {
    const { pdb, selection, blocks } = props;

    return (
        <div>
            {blocks.map(block => {
                const BlockComponent = block.component || ProtvistaPdb;

                return (
                    <ViewerBlock key={block.id} block={block}>
                        <BlockComponent pdb={pdb} selection={selection} block={block} />

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
