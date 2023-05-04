import EmojiObjectsIcon from "@material-ui/icons/EmojiObjects";
import React from "react";
import styled from "styled-components";

export interface ActionButtonProps {
    onClick: () => void;
}

export const ActionButton: React.FC<ActionButtonProps> = ({ onClick }) => {
    return (
        <StyledButton onClick={onClick}>
            Tutorial
            <EmojiObjectsIcon fontSize="small" />
        </StyledButton>
    );
};

export const StyledButton = styled.button`
    display: inline-flex;
    column-gap: 0.5em;
    align-items: center;

    .MuiSvgIcon-fontSizeSmall {
        font-size: 1.25em;
    }
`;
