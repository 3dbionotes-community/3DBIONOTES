import React from "react";
import styled from "styled-components";
import { HtmlTooltip } from "./HtmlTooltip";
import { styles } from "./Columns";
import { Typography } from "@material-ui/core";
import { sendAnalytics } from "../../../utils/analytics";

export const NoWrapTypography = styled(Typography)`
    &&& {
        font-size: 0.75rem;
    }
`;
/*
I only want to track the google anayltics if the text is undefined meaning it's a PDB eye only 
*/
export const Link: React.FC<LinkProps> = React.memo(props => {
    const { text, url, tooltip, children, style } = props;
  const sendPDBAnalytics = () => { 
      console.log("hello")
      console.log(text)
      console.log(tooltip)
      console.log(url)
      console.log(children)
      if(text === undefined && tooltip === undefined) {
          //it's a pdb
        sendAnalytics({ type: "event", category: "selectProteoma", action: "proteinId" });
      }
  }
  //href={url}
    if (props.url) {
        if (tooltip === undefined || typeof tooltip === "string") {
            return (
                <a
                    title={tooltip}
                    href={url}
                    onClick={sendPDBAnalytics}
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
