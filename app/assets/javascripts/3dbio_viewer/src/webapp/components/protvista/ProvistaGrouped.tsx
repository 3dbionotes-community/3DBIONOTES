import React from "react";
import _ from "lodash";
import { usePdbLoader } from "../../hooks/use-pdb";
import { allTracksBlock } from "./protvista-blocks";
import { ViewerBlock } from "../ViewerBlock";
import { ProtvistaPdb } from "./ProtvistaPdb";
import { useViewerState } from "../viewer-selector/viewer-selector.hooks";
import i18n from "../../utils/i18n";

export interface ProtvistaGroupedProps {}

export const ProtvistaGrouped: React.FC<ProtvistaGroupedProps> = React.memo(() => {
    const [viewerState] = useViewerState();
    const loader = usePdbLoader(viewerState.selection);
    const block = allTracksBlock;
    if (!loader) return null;

    return loader.type === "loaded" ? (
        <ViewerBlock block={block} namespace={namespace}>
            Protein: {loader.data.protein.id} | PDB: {loader.data.id} | Chain: {loader.data.chain}
            <ProtvistaPdb pdb={loader.data} block={block} showAllTracks={true} />
        </ViewerBlock>
    ) : (
        <div>{i18n.t("Loading...")}</div>
    );
});

const namespace = {};
