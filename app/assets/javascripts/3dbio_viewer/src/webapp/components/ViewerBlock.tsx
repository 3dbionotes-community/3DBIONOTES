import React from "react";
import styles from "./viewers/Viewers.module.css";

export interface BlockProps {
    block: ViewerBlockModel;
}

export interface ViewerBlockModel {
    id: string;
    title: string;
    description: string;
    help: string;
}

export const ViewerBlock: React.FC<BlockProps> = React.memo(props => {
    const { block, children } = props;
    const { title, description, help } = block;

    return (
        <div className={styles.section} id={block.id}>
            <div className={styles.title}>
                {title}
                <button title={help}>?</button>
            </div>

            <div className="contents">{description}</div>

            {children}
        </div>
    );
});
