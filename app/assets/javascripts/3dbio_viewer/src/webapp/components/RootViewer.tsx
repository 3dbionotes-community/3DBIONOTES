import React from "react";
import { Viewers } from "./viewers/Viewers";
import { MolecularStructure } from "./molecular-structure/MolecularStructure";
import { SelectionState } from "../view-models/SelectionState";

interface RootViewerProps {
    selection: SelectionState;
}

export const RootViewer: React.FC<RootViewerProps> = props => {
    const { selection } = props;

    return (
        <div id="viewer">
            <div id="left">
                <MolecularStructure selection={selection} />
            </div>

            <div id="right">
                <Viewers selection={selection} />
            </div>
        </div>
    );
};
