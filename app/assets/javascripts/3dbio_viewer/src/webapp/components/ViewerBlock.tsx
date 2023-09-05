import _ from "lodash";
import React, { useState } from "react";
import { ViewerTooltip } from "./viewer-tooltip/ViewerTooltip";
import { recordOfStyles } from "../../utils/ts-utils";
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
                <div className={css["block-actions"]}>
                    {help && (
                        <ViewerTooltip
                            title={help}
                            showTooltip={showTooltip}
                            setShowTooltip={setShowTooltip}
                        >
                            <EbiIconButton
                                onClick={() => setShowTooltip(!showTooltip)}
                                className="icon icon-common icon-question"
                            />
                        </ViewerTooltip>
                    )}
                    <EbiIconButton onClick={() => {}} className="icon icon-common icon-download" />
                </div>
            </div>

            <div className="contents">{interpolatedDescription}</div>

            {children}
        </div>
    );
});

const EbiIconButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = props => (
    <button onClick={props.onClick} className={css["small-button"]}>
        <i className={props.className} style={styles.icon}></i>
    </button>
);

const styles = recordOfStyles({
    icon: { fontSize: 11 },
});
