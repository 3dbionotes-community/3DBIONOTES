import React from "react";
import { Viewers } from "./viewers/Viewers";
import { MolecularStructure } from "./molecular-structure/MolecularStructure";
import { ViewerSelector } from "./viewer-selector/ViewerSelector";
import { useViewerState, Selector } from "./viewer-selector/viewer-selector.hooks";
import { usePdbInfo } from "../hooks/loader-hooks";
import { sendAnalytics } from "../utils/analytics";
import { useParams } from "react-router-dom";

export const RootViewer: React.FC = React.memo(() => {
    const [viewerState, { setSelection }] = useViewerState();
    const { selection } = viewerState;
    const { pdbInfo, setLigands } = usePdbInfo(selection);
    const params = useParams<Selector>();

    React.useEffect(() => sendAnalytics({ type: "pageView", path: `/viewer/${params?.selection}` }));

    return (
        <div id="viewer">
            <ViewerSelector
                pdbInfo={pdbInfo}
                selection={selection}
                onSelectionChange={setSelection}
            />

            <div id="left">
                <MolecularStructure
                    pdbInfo={pdbInfo}
                    selection={selection}
                    onSelectionChange={setSelection}
                    onLigandsLoaded={setLigands}
                />
            </div>

            <div id="right">{pdbInfo && <Viewers pdbInfo={pdbInfo} selection={selection} />}</div>
        </div>
    );
});
