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

                return (
                    <ViewerBlock key={block.id} block={block}>
                        <BlockComponent block={block} pdb={pdb} selection={selection} />
                    </ViewerBlock>
                );
            })}
        </div>
    );
};
