import React from "react";
import { Dialog as MuiDialog, DialogContent, DialogTitle, IconButton } from "@material-ui/core";
import { Close } from "@material-ui/icons";
import styled from "styled-components";

export interface DialogProps {
    title: string;
    open: boolean;
    onClose(): void;
}

export const Dialog: React.FC<DialogProps> = React.memo(({ onClose, title, open, children }) => {
    return (
        <StyledDialog open={open} onClose={onClose} maxWidth="md">
            <DialogTitle>
                <Title title={title}>{title}</Title>
                <IconButton onClick={onClose}>
                    <Close />
                </IconButton>
            </DialogTitle>

            <DialogContent>{children}</DialogContent>
        </StyledDialog>
    );
});

const StyledDialog = styled(MuiDialog)`
    .MuiDialogTitle-root {
        background: #607d8b;
        color: #fff;
        padding: 8px 24px;
        font-weight: 700;
    }

    .MuiDialogTitle-root .MuiIconButton-root {
        color: #fff;
    }

    .MuiTypography-h6 {
        line-height: 2.3 !important;
        display: flex;
    }

    .MuiDialogContent-root {
        padding: 24px 24px !important;
        overflow-x: auto !important;
        -webkit-overflow-scrolling: touch;
    }
`;

const Title = styled.span`
    display: inline-block;
    flex-grow: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;
