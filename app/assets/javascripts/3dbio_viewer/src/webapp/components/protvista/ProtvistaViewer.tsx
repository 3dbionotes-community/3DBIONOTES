import React from "react";
import { Pdb } from "../../../domain/entities/Pdb";
import "./protvista-pdb.css";
import { getBlocks } from "./Protvista.helpers";
import { ProtvistaBlock } from "./ProtvistaBlock";
import "./ProtvistaViewer.css";

export interface ProtvistaViewerProps {
    pdb: Pdb;
}

export const ProtvistaViewer: React.FC<ProtvistaViewerProps> = props => {
    const { pdb } = props;
    const blocks = React.useMemo(() => getBlocks(pdb), [pdb]);

    return (
        <div>
            {blocks.map(block => (
                <ProtvistaBlock key={block.id} block={block} />
            ))}
        </div>
    );
};
