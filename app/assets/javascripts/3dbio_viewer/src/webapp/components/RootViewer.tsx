import React from "react";
import { Viewers } from "./viewers/Viewers";
import { MolecularStructure } from "./molecular-structure/MolecularStructure";
import { ViewerSelector } from "./viewer-selector/ViewerSelector";
import { useViewerState } from "./viewer-selector/viewer-selector.hooks";

interface RootViewerProps {}

export const RootViewer: React.FC<RootViewerProps> = React.memo(() => {
    const [viewerState, { setSelection }] = useViewerState();
    const { selection } = viewerState;

    return (
        <div id="viewer">
            <ViewerSelector selection={selection} onSelectionChange={setSelection} />

            <div id="left">
                <MolecularStructure selection={selection} onSelectionChange={setSelection} />
            </div>

            <div id="right">
                <Viewers selection={selection} />
            </div>
        </div>
    );
});
