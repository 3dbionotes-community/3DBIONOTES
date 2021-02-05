import React from "react";
import { loadPdbView } from "./Protvista.helpers";
import styles from "./Protvista.module.css";
import { ProtvistaBlock, ProtvistaTrackElement } from "./Protvista.types";

export interface BlockProps {
    block: ProtvistaBlock;
}

export const Block: React.FC<BlockProps> = React.memo(props => {
    const { block } = props;
    const { title, description } = block;

    const elementRef = React.useRef<ProtvistaTrackElement>(null);

    React.useEffect(() => loadPdbView(elementRef, block.pdbView), [block.pdbView, elementRef]);

    return (
        <div className={styles.section} id={block.id}>
            <div className={styles.title}>
                {title}
                <button>?</button>
            </div>

            <div className="contents">{description}</div>

            <protvista-pdb custom-data="true" ref={elementRef}></protvista-pdb>
        </div>
    );
});
