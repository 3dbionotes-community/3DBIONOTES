import React from "react";
import { Route } from "react-router-dom";
import { MolecularStructure } from "../components/molecular-structure/MolecularStructure";
import { useViewerSelector } from "../components/viewer-selector/viewer-selector.hooks";
import { ViewerSelector } from "../components/viewer-selector/ViewerSelector";

export const MolecularStructurePage: React.FC<{ selector: string }> = React.memo(props => {
    const [selection, setSelection] = useViewerSelector(props.selector);

    return (
        <React.Fragment>
            <ViewerSelector selection={selection} onSelectionChange={setSelection} />
            <MolecularStructure selection={selection} onSelectionChange={setSelection} />
        </React.Fragment>
    );
});

export const MolecularStructureRoute: React.FC<{ path: string }> = React.memo(props => {
    return (
        <Route
            path={props.path}
            render={props => <MolecularStructurePage selector={props.match.params.selector} />}
        />
    );
});
