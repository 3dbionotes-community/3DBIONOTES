import React from "react";
import _ from "lodash";
import { usePdbLoader } from "../../hooks/use-pdb";
import { testblock } from "./protvista-blocks";
import { ViewerBlock } from "../ViewerBlock";
import { ProtvistaPdb } from "./ProtvistaPdb";
import { useViewerState } from "../viewer-selector/viewer-selector.hooks";
import i18n from "../../utils/i18n";
import { usePdbInfo } from "../../hooks/loader-hooks";

export interface ProtvistaGroupedProps {}

export const ProtvistaGrouped: React.FC<ProtvistaGroupedProps> = React.memo(() => {
    const viewerState = useViewerState({ type: "selector" });
    const { selection } = viewerState;
    const { pdbInfo } = usePdbInfo(selection, undefined);
    const [loader, _setLoader] = usePdbLoader(selection, pdbInfo);
    const block = testblock;

    if (loader.type !== "loaded")
        return <div>{loader.type === "loading" ? i18n.t("Loading...") : loader.message}</div>;

    return (
        <ViewerBlock block={block} namespace={namespace}>
            {i18n.t("Protein")}: {loader.data.protein.id} | {i18n.t("PDB")}: {loader.data.id} |
            {i18n.t("Chain")}: {loader.data.chainId}
            <ProtvistaPdb
                pdb={loader.data}
                block={block}
                showAllTracks={false}
                uploadData={undefined}
            />
        </ViewerBlock>
    );
});

const namespace = {};
