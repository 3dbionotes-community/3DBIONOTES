import React from "react";
import { useViewerState } from "./viewer-selector/viewer-selector.hooks";
import { RootViewerContents } from "./RootViewerContents";

export interface RootViewerProps {
    from: "selector" | "uploaded";
}

export const RootViewer: React.FC<RootViewerProps> = React.memo(props => {
    const { from } = props;
    const viewerState = useViewerState({ type: from });

    return <RootViewerContents viewerState={viewerState} />;
});
