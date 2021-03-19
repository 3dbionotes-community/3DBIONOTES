import React from "react";
import _ from "lodash";
import { SelectionState } from "../../view-models/SelectionState";
import { usePdbLoader } from "../../hooks/use-pdb";
import { allTracksBlock } from "./protvista-blocks";
import { ViewerBlock } from "../ViewerBlock";
import { ProtvistaPdb } from "./ProtvistaPdb";

export interface ProtvistaGroupedProps {
    selection: SelectionState;
}

export const ProtvistaGrouped: React.FC<ProtvistaGroupedProps> = React.memo(() => {
    const loader = usePdbLoader();
    const block = allTracksBlock;

    return loader.type === "loaded" ? (
        <ViewerBlock block={block}>
            <ProtvistaPdb pdb={loader.data} block={block} showAllTracks={true} />
        </ViewerBlock>
    ) : (
        <div>Loading...</div>
    );
});
