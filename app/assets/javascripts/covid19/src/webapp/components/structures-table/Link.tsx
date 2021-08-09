import React from "react";
import { HtmlTooltip } from "./HtmlTooltip";
import { styles } from "./Columns";

export const Link: React.FC<LinkProps> = React.memo(props => {
    const { text, url, tooltip, children } = props;

    if (props.url) {
        if (tooltip === undefined || typeof tooltip === "string") {
            return (
                <a title={tooltip} href={url} target="_blank" rel="noreferrer" style={styles.link}>
                    {text}
                    {children}
                </a>
            );
        } else {
            return (
                <HtmlTooltip title={tooltip}>
                    <a href={url} target="_blank" rel="noreferrer" style={styles.link}>
                        {text}
                        {children}
                    </a>
                </HtmlTooltip>
            );
        }
    } else {
        if (tooltip === undefined || typeof tooltip === "string") {
            return (
                <span title={tooltip}>
                    {text}
                    {children}
                </span>
            );
        } else {
            return (
                <HtmlTooltip title={tooltip}>
                    <span>
                        {text}
                        {children}
                    </span>
                </HtmlTooltip>
            );
        }
    }
});
interface LinkProps {
    text?: string;
    url?: string;
    tooltip?: NonNullable<React.ReactNode>;
}
