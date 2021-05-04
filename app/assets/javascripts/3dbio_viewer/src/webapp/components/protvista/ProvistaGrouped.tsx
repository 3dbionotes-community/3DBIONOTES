import React from "react";
import _ from "lodash";
import { usePdbLoader } from "../../hooks/use-pdb";
import { allTracksBlock } from "./protvista-blocks";
import { ViewerBlock } from "../ViewerBlock";
import { ProtvistaPdb } from "./ProtvistaPdb";
import { useViewerState } from "../viewer-selector/viewer-selector.hooks";
import i18n from "../../utils/i18n";
import { usePdbInfo } from "../../hooks/loader-hooks";

export interface ProtvistaGroupedProps {}

export const ProtvistaGrouped: React.FC<ProtvistaGroupedProps> = React.memo(() => {
    const [viewerState] = useViewerState();
    const { selection } = viewerState;
    const pdbInfo = usePdbInfo(selection);
    const loader = usePdbLoader(selection, pdbInfo);
    const block = allTracksBlock;
    if (!loader) return null;

    return loader.type === "loaded" ? (
        <ViewerBlock block={block} namespace={namespace}>
            Protein: {loader.data.protein.id} | PDB: {loader.data.id} | Chain: {loader.data.chainId}
            <ProtvistaPdb pdb={loader.data} block={block} showAllTracks={true} />
        </ViewerBlock>
    ) : (
        <div>{loader.type === "loading" ? i18n.t("Loading...") : loader.message}</div>
    );
});

const namespace = {};
