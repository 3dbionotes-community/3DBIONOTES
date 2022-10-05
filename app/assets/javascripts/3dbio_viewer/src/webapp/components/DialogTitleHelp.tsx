import React from "react";
import styled from "styled-components";
import { DialogTitle, IconButton } from "@material-ui/core";
import { Close, HelpOutline as HelpOutlineIcon } from "@material-ui/icons";
import { HtmlTooltip, styles } from "./HtmlTooltip";

interface DialogTitleHelpProps {
    title: string;
    onClose: () => void;
    tooltip: NonNullable<React.ReactNode>;
}

export const DialogTitleHelp: React.FC<DialogTitleHelpProps> = React.memo(props => {
    const { title, tooltip, onClose } = props;
    return (
        <StyledDialogTitle>
            {title}
            <HtmlTooltip title={tooltip}>
                <span style={styles.tooltip}>
                    <HelpOutlineIcon />
                </span>
            </HtmlTooltip>
            <IconButton onClick={onClose}>
                <Close />
            </IconButton>
        </StyledDialogTitle>
    );
});

const StyledDialogTitle = styled(DialogTitle)`
    .MuiTypography-root {
        display: flex;
        flex-direction: row;
        align-items: center;
        width: 100%;
        .MuiButtonBase-root.MuiIconButton-root {
            margin-left: auto;
        }
    }
`;
