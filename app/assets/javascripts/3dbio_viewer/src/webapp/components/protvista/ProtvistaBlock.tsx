import React from "react";
import { ViewerBlock } from "../ViewerBlock";
import { loadPdbView } from "./Protvista.helpers";
import { ProtvistaBlock as ProtvistaBlockM, ProtvistaTrackElement } from "./Protvista.types";

export interface BlockProps {
    block: ProtvistaBlockM;
}

export const ProtvistaBlock: React.FC<BlockProps> = React.memo(props => {
    const { block } = props;

    const elementRef = React.useRef<ProtvistaTrackElement>(null);

    React.useEffect(() => {
        return loadPdbView(elementRef, block.pdbView);
    }, [block.pdbView, elementRef]);

    return (
        <ViewerBlock block={block}>
            <protvista-pdb custom-data="true" ref={elementRef}></protvista-pdb>
        </ViewerBlock>
    );
});
