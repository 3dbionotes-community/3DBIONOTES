import { Theme, Typography, withStyles } from "@material-ui/core";
import { Tooltip } from "@material-ui/core";
import styled from "styled-components";

export const HtmlTooltip = withStyles((theme: Theme) => ({
    tooltip: {
        backgroundColor: "#f5f5f9",
        color: "rgba(0, 0, 0, 0.87)",
        maxWidth: 600,
        fontSize: theme.typography.pxToRem(12),
        border: "1px solid #dadde9",
    },
}))(Tooltip);

export const TooltipTypography = styled(Typography)`
    &.MuiTypography-body2 {
        font-size: 0.75rem;
        color: rgba(0, 0, 0, 0.87);
        word-wrap: break-word;
        font-family: "Roboto", "Helvetica", "Arial", sans-serif;
        font-weight: 500;
    }
`;

export const styles = {
    tooltip: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        height: "45px",
        width: "45px",
        margin: "auto 5px",
        color: "#ffffff",
        backgroundColor: "#607d8b",
        borderRadius: "0.75rem",
        outline: "none",
        cursor: "pointer",
    },
};
