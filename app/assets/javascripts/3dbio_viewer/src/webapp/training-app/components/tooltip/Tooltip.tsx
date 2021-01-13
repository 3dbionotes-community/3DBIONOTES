import React from "react";
import styled from "styled-components";

export const Tooltip: React.FC<TooltipProps> = ({
    className,
    text,
    children,
    placement = "left",
}) => {
    return (
        <TooltipWrapper className={className}>
            {children}
            <TooltipText placement={placement}>{text}</TooltipText>
        </TooltipWrapper>
    );
};

export interface TooltipProps {
    className?: string;
    text: string;
    placement?: "right" | "left";
}

export const TooltipText = styled.span<{ placement: "right" | "left" }>`
    visibility: hidden;
    width: 120px;
    background-color: #fff;
    color: #276696;
    text-align: center;
    padding: 5px 10px;
    border-radius: 6px;

    position: absolute;
    z-index: 1;
    top: -5px;
    right: ${({ placement }) => (placement === "left" ? "150%" : "unset")};

    ::after {
        content: " ";
        position: absolute;
        top: 50%;
        right: ${({ placement }) => (placement === "right" ? "100%" : "unset")};
        left: ${({ placement }) => (placement === "left" ? "100%" : "unset")};
        margin-top: -5px;
        border-width: 5px;
        border-style: solid;
        border-color: ${({ placement }) =>
            placement === "left"
                ? "transparent transparent transparent white"
                : "transparent white transparent transparent"};
    }
`;

export const TooltipWrapper = styled.div`
    position: relative;
    float: right;

    :not(:active):hover ${TooltipText} {
        visibility: visible;
    }
`;
