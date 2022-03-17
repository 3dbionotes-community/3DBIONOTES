import React from "react";
import { Pdb } from "../../../domain/entities/Pdb";
import { routes } from "../../../routes";
import { Maybe, recordOfStyles } from "../../../utils/ts-utils";
import { FrameViewer, postToIFrame } from "../frame-viewer/FrameViewer";
import { TrackDef } from "../protvista/Protvista.types";
import { FeaturesButton } from "./FeaturesButton";
import {
    graphFeatures,
    FeatureId,
    PPIIframeContentWindow,
    getInfoAlignmentFromPdb,
} from "./ppi-data";

interface PPiViewerProps {
    trackDef: TrackDef;
    pdb: Pdb;
}

export const PPIViewer: React.FC<PPiViewerProps> = props => {
    const { pdb, trackDef } = props;
    const title = `${trackDef.name}: ${trackDef.description || "-"}`;
    const iframeRef = React.useRef<HTMLIFrameElement>(null);
    const infoAlignment = useInfoAlignment(pdb);
    const loadFeatures = useLoadFeaturesAction(iframeRef);
    useIframeDataPost(pdb);

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

/* Post data to PPI iframe to render contents.

    See app/controllers/frames_ppi_controller.rb
    Accepted params (GET or POST): pdb=ID OR ppi_network=JSON_CONTAINING_NODES_AND_EDGES
    ppi_network is too large to use a GET query string, so post to the iframe instead.
*/
function useIframeDataPost(pdb: Pdb) {
    React.useEffect(() => {
        const src = routes.bionotesDev + "/ppiIFrame";
        const params = pdb.proteinNetwork
            ? { ppi_network: pdb.proteinNetwork.networkGraph }
            : pdb.id
            ? { pdb: pdb.id }
            : undefined;
        if (params) postToIFrame({ name: iframeName, url: src, params });
    }, [pdb.proteinNetwork, pdb.id]);
}

function useLoadFeaturesAction(iframeRef: React.RefObject<HTMLIFrameElement>) {
    return React.useCallback(
        (featureId: FeatureId) => {
            const { featureKey } = graphFeatures[featureId];
            const contentWindow = iframeRef.current?.contentWindow as Maybe<PPIIframeContentWindow>;
            if (!contentWindow) return;

            // See app/assets/javascripts/main_frame/ppi_annotations.js
            contentWindow.cytoscape_graph.load_features(featureKey);
        },
        [iframeRef]
    );
}

function useInfoAlignment(pdb: Pdb) {
    const alignment = React.useMemo(() => getInfoAlignmentFromPdb(pdb), [pdb]);

    React.useEffect(() => {
        // Global variables used by ppi_frame
        if (alignment) window.global_infoAlignment = alignment;
        if (pdb.proteinNetwork) window.network_flag = true;
        if (pdb.customAnnotations)
            window.uploaded_annotations = { result: pdb.customAnnotations.data };
    }, [alignment, pdb.proteinNetwork, pdb.customAnnotations]);

    return alignment;
}
