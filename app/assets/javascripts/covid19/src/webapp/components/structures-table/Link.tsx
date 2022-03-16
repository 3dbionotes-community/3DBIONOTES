import React from "react";
import styled from "styled-components";
import { HtmlTooltip } from "./HtmlTooltip";
import { styles } from "./Columns";
import { Typography } from "@material-ui/core";

export const NoWrapTypography = styled(Typography)`
    &&& {
        font-size: 0.75rem;
    }
`;

export const Link: React.FC<LinkProps> = React.memo(props => {
    const { text, url, tooltip, children, style } = props;
    if (props.url) {
        if (tooltip === undefined || typeof tooltip === "string") {
            return (
                <a
                    title={tooltip}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ ...styles.link, ...style }}
                >
                    <NoWrapTypography>{text}</NoWrapTypography>
                    {children}
                </a>
            );
        } else {
            return (
                <HtmlTooltip title={tooltip}>
                    <li>
                        <a href={url} target="_blank" rel="noreferrer" style={styles.link}>
                            <NoWrapTypography>{text}</NoWrapTypography>
                            {children}
                        </a>
                    </li>
                </HtmlTooltip>
            );
        }
    } else {
        if (tooltip === undefined || typeof tooltip === "string") {
            return (
                <span title={tooltip}>
                    <NoWrapTypography>{text}</NoWrapTypography>
                    {children}
                </span>
            );
        } else if (text === undefined) {
            return (
                <HtmlTooltip title={tooltip}>
                    <span>{children}</span>
                </HtmlTooltip>
            );
        } else {
            return (
                <HtmlTooltip title={tooltip}>
                    <li>
                        <NoWrapTypography>{text}</NoWrapTypography>
                        {children}
                    </li>
                </HtmlTooltip>
            );
        }
    }
});

export interface LinkProps {
    text?: string;
    url?: string;
    tooltip?: Tooltip;
    style?: Record<string, string | number | boolean>;
}

export type Tooltip = NonNullable<React.ReactNode>;
