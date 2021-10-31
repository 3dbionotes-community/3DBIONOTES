import React from "react";
import styled from "styled-components";
import { HtmlTooltip } from "./HtmlTooltip";
import { styles } from "./Columns";
import { Typography } from "@material-ui/core";

export const NoWrapTypography = styled(Typography)`
    word-wrap: break-word;
`;

export const Link: React.FC<LinkProps> = React.memo(props => {
    const { text, url, tooltip, children } = props;

    if (props.url) {
        if (tooltip === undefined || typeof tooltip === "string") {
            return (
                <a title={tooltip} href={url} target="_blank" rel="noreferrer" style={styles.link}>
                    <NoWrapTypography>{text}</NoWrapTypography>
                    {children}
                </a>
            );
        } else {
            return (
                <HtmlTooltip title={tooltip}>
                    <a href={url} target="_blank" rel="noreferrer" style={styles.link}>
                        <NoWrapTypography>{text}</NoWrapTypography>
                        {children}
                    </a>
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
        } else {
            return (
                <HtmlTooltip title={tooltip}>
                    <span>
                        <NoWrapTypography>{text}</NoWrapTypography>
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
