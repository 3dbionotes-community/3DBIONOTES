import { Fab } from "@material-ui/core";
import EmojiObjectsIcon from "@material-ui/icons/EmojiObjects";
import React from "react";
import styled from "styled-components";

export interface ActionButtonProps {
    onClick: () => void;
}

export const ActionButton: React.FC<ActionButtonProps> = ({ onClick }) => {
    return (
        <StyledFab variant="extended" size="large" color="primary" onClick={onClick}>
            <EmojiObjectsIcon />
            <p>{"Tutorial"}</p>
        </StyledFab>
    );
};

const StyledFab = styled(Fab)`
    position: fixed;
    margin: 6px;
    bottom: 20px;
    right: 40px;
    display: inline-flex;
    cursor: pointer;
    align-items: center;
    padding: 0px 20px;
    color: #fff;
    background-color: #133546;
    border-color: #133546;
    border-radius: 100px;

    :hover {
        background-color: #607d8b;
    }

    svg {
        margin-right: 6px;
    }
`;
