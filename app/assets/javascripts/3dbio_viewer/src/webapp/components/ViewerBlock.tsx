import _ from "lodash";
import React, { useState } from "react";
import { ViewerTooltip } from "./viewer-tooltip/ViewerTooltip";
import { recordOfStyles } from "../../utils/ts-utils";
import css from "./viewers/Viewers.module.css";
import i18n from "d2-ui-components/locales";

export interface BlockProps {
    block: ViewerBlockModel;
    namespace: Record<string, string | number | undefined>;
    onDownload?: () => void;
}

export interface ViewerBlockModel {
    id: string;
    title: string;
    description: string;
    help: string;
    isSubtitle: boolean;
}

export const ViewerBlock: React.FC<BlockProps> = React.memo(props => {
    const { block, namespace, children, onDownload } = props;
    const { title, description, help, isSubtitle } = block;
    const [showHelpTooltip, setShowHelpTooltip] = useState(false);
    const [showDownloadTooltip, setShowDownloadTooltip] = useState(false);
    const stringNamespace = _.mapValues(namespace, value => (value ?? "?").toString());
    const interpolatedDescription = _.template(description)(stringNamespace);
    const interpolatedTitle = _.template(title)(stringNamespace);

    return (
        <div style={isSubtitle ? styles.subtitleBlock : styles.titleBlock} id={block.id}>
            <div className={css.title}>
                <span style={isSubtitle ? styles.subtitle : styles.title}>{interpolatedTitle}</span>
                <div className={css["block-actions"]}>
                    {help && (
                        <TooltipIconButton
                            title={help}
                            onClick={() => setShowHelpTooltip(!showHelpTooltip)}
                            className="icon icon-common icon-question"
                            showTooltip={showHelpTooltip}
                            setShowTooltip={setShowHelpTooltip}
                        />
                    )}
                    {onDownload && (
                        <TooltipIconButton
                            title={i18n.t("Download block annotations")}
                            onClick={() => onDownload()}
                            className="icon icon-common icon-download"
                            showTooltip={showDownloadTooltip}
                            setShowTooltip={setShowDownloadTooltip}
                        />
                    )}
                </div>
            </div>
            <div className={css.contents}>{interpolatedDescription}</div>
            {children}
        </div>
    );
});

interface TooltipIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    showTooltip: boolean;
    setShowTooltip: (value: boolean) => void;
}

const TooltipIconButton: React.FC<TooltipIconButtonProps> = props => {
    const { title, showTooltip, setShowTooltip } = props;

    return (
        <ViewerTooltip
            title={<>{title}</>}
            showTooltip={showTooltip}
            setShowTooltip={setShowTooltip}
        >
            <button onClick={props.onClick} className={css["small-button"]}>
                <i className={props.className} style={ebiStyles.icon}></i>
            </button>
        </ViewerTooltip>
    );
};

const styles = recordOfStyles({
    title: { fontSize: "1.5rem" },
    subtitle: { fontSize: "1.125rem", letterSpacing: 0.1 },
    titleBlock: {
        margin: "1.7em 0 0",
        padding: "0 1.5rem",
    },
    subtitleBlock: {
        margin: "1.5em 0 0",
        padding: "0 1.5rem",
    },
});

export const ebiStyles = recordOfStyles({
    icon: { fontSize: 11 },
    "icon-lg": { fontSize: 20 },
});
