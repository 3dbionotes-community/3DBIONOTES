import React from "react";
import _ from "lodash";
import { usePdbLoader } from "../../hooks/use-pdb";
import { allTracksBlock } from "./protvista-blocks";
import { ViewerBlock } from "../ViewerBlock";
import { ProtvistaPdb } from "./ProtvistaPdb";
import { useViewerSelector } from "../viewer-selector/viewer-selector.hooks";

export interface ProtvistaGroupedProps {
    selector: string;
}

export const ProtvistaGrouped: React.FC<ProtvistaGroupedProps> = React.memo((props) => {
    const [selection] = useViewerSelector(props.selector);
    const loader = usePdbLoader(selection);
    const block = allTracksBlock;

    return loader.type === "loaded" ? (
        <ViewerBlock block={block}>
            PDB: {loader.data.id}
            <ProtvistaPdb pdb={loader.data} block={block} showAllTracks={true} />
        </ViewerBlock>
    ) : (
        <div>Loading...</div>
    );
});
