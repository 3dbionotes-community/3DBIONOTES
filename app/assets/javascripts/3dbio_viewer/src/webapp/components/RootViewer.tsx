import React from "react";
import { Viewers } from "./viewers/Viewers";
import { MolecularStructure } from "./molecular-structure/MolecularStructure";
import { SelectionState } from "../view-models/SelectionState";
import { ViewerSelector } from "./viewer-selector/ViewerSelector";

interface RootViewerProps {
    selection: SelectionState;
    onSelectionChange(newSelection: SelectionState): void;
}

export const RootViewer: React.FC<RootViewerProps> = props => {
    const { selection, onSelectionChange } = props;

    return (
        <div id="viewer">
            <ViewerSelector selection={selection} onSelectionChange={onSelectionChange} />

            <div id="left">
                <MolecularStructure selection={selection} />
            </div>

            <div id="right">
                <Viewers selection={selection} />
            </div>
        </div>
    );
};
