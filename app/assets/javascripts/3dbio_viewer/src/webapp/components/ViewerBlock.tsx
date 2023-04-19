import _ from "lodash";
import React, { useState } from "react";
import { ViewerTooltip } from "./viewer-tooltip/ViewerTooltip";
import css from "./viewers/Viewers.module.css";

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
    const [showTooltip, setShowTooltip] = useState(false);
    const { title, description, help } = block;
    const stringNamespace = _.mapValues(namespace, value => (value ?? "?").toString());
    const interpolatedDescription = _.template(description)(stringNamespace);

    return (
        <div className={css.section} id={block.id}>
            <div className={css.title}>
                {title}
                {help && (
                    <ViewerTooltip
                        title={help}
                        showTooltip={showTooltip}
                        setShowTooltip={setShowTooltip}
                    >
                        <button
                            onClick={() => setShowTooltip(!showTooltip)}
                            className={css["small-button"]}
                        >
                            ?
                        </button>
                    </ViewerTooltip>
                )}
            </div>

            <div className="contents">{interpolatedDescription}</div>

            {children}
        </div>
    );
});
