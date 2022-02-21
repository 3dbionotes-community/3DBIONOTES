import React from "react";
import { Pdb } from "../../../domain/entities/Pdb";
import { routes } from "../../../routes";
import { Maybe, recordOfStyles } from "../../../utils/ts-utils";
import { FrameViewer, postToIFrame } from "../frame-viewer/FrameViewer";
import { TrackDef } from "../protvista/Protvista.types";
import { FeaturesButton } from "./FeaturesButton";
import { graphFeatures, FeatureId, InfoAlignment, PPIIframeContentWindow } from "./ppi-data";

interface PPiViewerProps {
    trackDef: TrackDef;
    pdb: Pdb;
}

export const PPIViewer: React.FC<PPiViewerProps> = props => {
    const { pdb, trackDef } = props;
    const title = `${trackDef.name}: ${trackDef.description || "-"}`;

    const infoAlignment = React.useMemo<Maybe<InfoAlignment>>(() => {
        if (pdb.proteinNetwork) {
            return {
                origin: "interactome3d",
                acc: pdb.protein.id,
                file: pdb.file || "",
                path: pdb.path || "",
                pdb: pdb.file || "",
                chain: pdb.chainId,
            };
        } else if (pdb.id) {
            return {
                origin: "PDB",
                pdb: pdb.id,
                chain: pdb.chainId,
            };
        }
    }, [pdb]);

    React.useEffect(() => {
        // window.global_infoAlignment: Global variable accessed by the PPI iframe
        if (infoAlignment) window.global_infoAlignment = infoAlignment;
    }, [infoAlignment]);

    const iframeRef = React.useRef<HTMLIFrameElement>(null);

    const loadFeatures = React.useCallback((featureId: FeatureId) => {
        const { featureKey } = graphFeatures[featureId];
        const contentWindow = iframeRef.current?.contentWindow as Maybe<PPIIframeContentWindow>;
        if (!contentWindow) return;

        // See app/assets/javascripts/main_frame/ppi_annotations.js
        contentWindow.cytoscape_graph.load_features(featureKey);
    }, []);

    // See app/controllers/frames_ppi_controller.rb
    // Accepted params (GET or POST): pdb=ID OR ppi_network=JSON_CONTAINING_NODES_AND_EDGES
    // ppi_network is too large to use a GET query string, so we post to the iframe instead.
    React.useEffect(() => {
        const src = routes.bionotesDev + "/ppiIFrame";
        const params = pdb.proteinNetwork
            ? { ppi_network: pdb.proteinNetwork.networkGraph }
            : pdb.id
            ? { pdb: pdb.id }
            : undefined;
        if (params) postToIFrame({ name: iframeName, url: src, params });
    }, [pdb.proteinNetwork, pdb.id]);

    if (!infoAlignment) return null;

    return (
        <FrameViewer name={iframeName} ref={iframeRef} title={title}>
            <div style={styles.featuresButton}>
                <FeaturesButton onClick={loadFeatures} />
            </div>
        </FrameViewer>
    );
};

const iframeName = "ppi";

const styles = recordOfStyles({
    featuresButton: { float: "right" },
});
