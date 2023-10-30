import React from "react";
import { ClickAwayListener, Fade } from "@material-ui/core";
import { SmallHtmlTooltip } from "../HtmlTooltip";

interface ViewerTooltipProps {
    title: NonNullable<React.ReactNode>;
    showTooltip: boolean;
    setShowTooltip: (value: boolean) => void;
    children: React.ReactElement;
}

export const ViewerTooltip: React.FC<ViewerTooltipProps> = ({
    title,
    showTooltip,
    setShowTooltip,
    children,
}: ViewerTooltipProps) => {
    const handleClose = () => setShowTooltip(false);
    const handleOpen = () => setShowTooltip(true);
    return (
        <ClickAwayListener onClickAway={handleClose}>
            <SmallHtmlTooltip
                title={title}
                placement="right-end"
                interactive
                TransitionComponent={Fade}
                TransitionProps={{ timeout: 600 }}
                open={showTooltip}
                onOpen={handleOpen}
                onClose={handleClose}
            >
                {children}
            </SmallHtmlTooltip>
        </ClickAwayListener>
    );
};
