import React from "react";
import { Pdb } from "../../../domain/entities/Pdb";
import { routes } from "../../../routes";
import { recordOfStyles } from "../../../utils/ts-utils";
import { Selection } from "../../view-models/Selection";
import { FrameViewer } from "../frame-viewer/FrameViewer";
import { TrackDef } from "../protvista/Protvista.types";
import { FeaturesButton } from "./FeaturesButton";
import { graphFeatures, FeatureId, InfoAlignment, PPIIframeContentWindow } from "./ppi-data";

interface PPiViewerProps {
    trackDef: TrackDef;
    pdb: Pdb;
    selection: Selection;
}

export const PPIViewer: React.FC<PPiViewerProps> = props => {
    const { pdb, trackDef } = props;
    const title = `${trackDef.name}: ${trackDef.description || "-"}`;

    const infoAlignment = React.useMemo<InfoAlignment | undefined>(() => {
        return pdb.id ? { origin: "PDB", pdb: pdb.id, chain: pdb.chainId } : undefined;
    }, [pdb.id, pdb.chainId]);

    React.useEffect(() => {
        // global_infoAlignment: Global variable accessed by PPI iframe
        if (infoAlignment) window.global_infoAlignment = infoAlignment;
    }, [infoAlignment]);

    const iframeRef = React.useRef<HTMLIFrameElement>(null);

    const loadFeatures = React.useCallback((featureId: FeatureId) => {
        const { featureKey } = graphFeatures[featureId];
        const contentWindow = iframeRef.current?.contentWindow as
            | PPIIframeContentWindow
            | undefined;
        if (!contentWindow) return;

        // app/assets/javascripts/main_frame/ppi_annotations.js
        contentWindow.cytoscape_graph.load_features(featureKey);
    }, []);

    if (!pdb.id) return null;

    const src = routes.bionotes + `/ppiIFrame?pdb=${pdb.id}`;

    return (
        <FrameViewer ref={iframeRef} title={title} src={src}>
            <div style={styles.featuresButton}>
                <FeaturesButton onClick={loadFeatures} />
            </div>
        </FrameViewer>
    );
};

const styles = recordOfStyles({
    featuresButton: { float: "right" },
});
