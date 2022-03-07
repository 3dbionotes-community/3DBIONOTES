import React from "react";
import { useViewerState } from "./viewer-selector/viewer-selector.hooks";
import { RootViewerContents } from "./RootViewerContents";
import { sendAnalytics } from "../utils/analytics";

export interface RootViewerProps {
    from: "selector" | "uploaded" | "network";
}

export const RootViewer: React.FC<RootViewerProps> = React.memo(props => {
    const { from } = props;
    const viewerState = useViewerState({ type: from });

    React.useEffect(() =>
        sendAnalytics({ type: "pageView", path: `/viewer/${window.location.hash}` })
    );

    return <RootViewerContents viewerState={viewerState} />;
});
