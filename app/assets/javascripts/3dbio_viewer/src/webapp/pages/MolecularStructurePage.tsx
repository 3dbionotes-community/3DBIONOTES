import React from "react";
import { MolecularStructure } from "../components/molecular-structure/MolecularStructure";
import { useViewerState } from "../components/viewer-selector/viewer-selector.hooks";
import { ViewerSelector } from "../components/viewer-selector/ViewerSelector";

export const MolecularStructurePage: React.FC = React.memo(() => {
    const [viewerState, { setSelection }] = useViewerState();
    const { selection } = viewerState;

    return (
        <React.Fragment>
            <ViewerSelector selection={selection} onSelectionChange={setSelection} />
            <MolecularStructure selection={selection} onSelectionChange={setSelection} />
        </React.Fragment>
    );
});

