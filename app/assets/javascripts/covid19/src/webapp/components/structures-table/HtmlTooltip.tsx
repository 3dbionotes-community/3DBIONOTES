import { Theme, withStyles } from "@material-ui/core";
import { Tooltip } from "@material-ui/core";

export const HtmlTooltip = withStyles((theme: Theme) => ({
    tooltip: {
        backgroundColor: "#f5f5f9",
        color: "rgba(0, 0, 0, 0.87)",
        maxWidth: 600,
        fontSize: theme.typography.pxToRem(12),
        border: "1px solid #dadde9",
    },
    arrow: { color: "#dadde9" },
}))(Tooltip);
