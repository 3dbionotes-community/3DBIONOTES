import EmojiObjectsIcon from "@material-ui/icons/EmojiObjects";
import React from "react";
import styled from "styled-components";
import i18n from "../../../utils/i18n";

export interface ActionButtonProps {
    onClick: () => void;
    expanded: boolean;
}

export const ActionButton: React.FC<ActionButtonProps> = ({ onClick, expanded }) => {
    return (
        <StyledButton onClick={onClick}>
            <EmojiObjectsIcon fontSize="small" />
            {expanded && i18n.t("Tutorial")}
        </StyledButton>
    );
};

export const StyledButton = styled.button`
    display: inline-flex;
    font-size: 14px;
    letter-spacing: 0.02em;
    column-gap: 4px; /*not em intentionally*/
    align-items: center;

    .MuiSvgIcon-fontSizeSmall {
        font-size: 1.25em;
    }
`;
