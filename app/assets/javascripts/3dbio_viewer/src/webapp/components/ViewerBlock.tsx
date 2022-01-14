import React from "react";
import _ from "lodash";
import styles from "./viewers/Viewers.module.css";

export interface BlockProps {
    block: ViewerBlockModel;
    namespace: Record<string, string | number | undefined>;
}

export interface ViewerBlockModel {
    id: string;
    title: string;
    description: string;
    help: string;
}

export const ViewerBlock: React.FC<BlockProps> = React.memo(props => {
    const { block, namespace, children } = props;
    const { title, description, help } = block;
    const stringNamespace = _.mapValues(namespace, value => (value || "?").toString());
    const interpolatedDescription = _.template(description)(stringNamespace);

    return (
        <div className={styles.section} id={block.id}>
            <div className={styles.title}>
                {title}
                {help && <button title={help}>?</button>}
            </div>

            <div className="contents">{interpolatedDescription}</div>

            {children}
        </div>
    );
});
