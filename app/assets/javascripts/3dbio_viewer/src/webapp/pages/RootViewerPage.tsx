import React from "react";
import { Route } from "react-router-dom";
import { RootViewer } from "../components/RootViewer";
import { useViewerSelector } from "../components/viewer-selector/viewer-selector.hooks";

export const RootViewerPage: React.FC<{ selector?: string }> = React.memo(props => {
    const [selection, setSelection] = useViewerSelector(props.selector || "6vsb");

    return <RootViewer selection={selection} onSelectionChange={setSelection} />;
});

export const RootViewerRoute: React.FC<{ path: string }> = React.memo(props => {
    return (
        <Route
            path={props.path}
            render={props => <RootViewerPage selector={props.match.params.selector} />}
        />
    );
});
