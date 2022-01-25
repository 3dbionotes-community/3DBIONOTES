import React, { useState } from "react";
import _ from "lodash";
import styles from "./viewers/Viewers.module.css";
import { Tooltip, ClickAwayListener, Fade } from "@material-ui/core";

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
    const stringNamespace = _.mapValues(namespace, value => (value || "?").toString());
    const interpolatedDescription = _.template(description)(stringNamespace);

    const handleClose = () => setShowTooltip(false);
    const handleOpen = () => setShowTooltip(true);

    return (
        <div className={styles.section} id={block.id}>
            <div className={styles.title}>
                {title}
                {help && (
                    <ClickAwayListener onClickAway={handleClose}>
                        <Tooltip
                            title={help}
                            placement="right-end"
                            interactive
                            TransitionComponent={Fade}
                            TransitionProps={{ timeout: 600 }}
                            open={showTooltip}
                            onOpen={handleOpen}
                            onClose={handleClose}
                        >
                            <button onClick={() => setShowTooltip(!showTooltip)}>?</button>
                        </Tooltip>
                    </ClickAwayListener>
                )}
            </div>

            <div className="contents">{interpolatedDescription}</div>

            {children}
        </div>
    );
});
