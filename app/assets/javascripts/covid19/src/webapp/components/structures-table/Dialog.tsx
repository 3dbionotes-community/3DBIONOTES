import React from "react";
import styled from "styled-components";
import { Dialog as MuiDialog, DialogContent, DialogTitle, IconButton } from "@material-ui/core";
import { Close } from "@material-ui/icons";

export interface DialogProps {
    className?: string;
    title: string;
    open: boolean;
    headerChildren?: React.ReactNode;
    maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | false;
    onClose(): void;
}

export const Dialog: React.FC<DialogProps> = React.memo(
    ({ onClose, className, title, open, children, maxWidth, headerChildren }) => {
        return (
            <StyledDialog
                className={className}
                open={open}
                onClose={onClose}
                maxWidth={maxWidth ?? "md"}
            >
                <StyledDialogTitle>
                    <Title title={title}>{title}</Title>
                    {headerChildren}
                    <StyledIconButton onClick={onClose}>
                        <Close />
                    </StyledIconButton>
                </StyledDialogTitle>

                <DialogContent>{children}</DialogContent>
            </StyledDialog>
        );
    }
);

const StyledDialog = styled(MuiDialog)`
    .MuiDialog-paper {
        min-width: 480px;
    }

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
        padding: 24px;
        overflow-x: auto !important;
        -webkit-overflow-scrolling: touch;
    }
`;

const StyledDialogTitle = styled(DialogTitle)`
    & .MuiTypography-h6 {
        align-items: center;
    }
`;

const StyledIconButton = styled(IconButton)`
    &.MuiIconButton-root {
        margin-left: auto;
    }
`;

const Title = styled.span`
    display: inline-block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1;
`;
