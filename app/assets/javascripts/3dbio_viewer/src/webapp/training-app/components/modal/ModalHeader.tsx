import AddIcon from "@material-ui/icons/Add";
import CloseIcon from "@material-ui/icons/Close";
import DragIndicatorIcon from "@material-ui/icons/DragIndicator";
import HomeIcon from "@material-ui/icons/Home";
import MinimizeIcon from "@material-ui/icons/Minimize";
import SettingsIcon from "@material-ui/icons/Settings";
import React from "react";
import styled from "styled-components";
import { Tooltip, TooltipText, TooltipWrapper } from "../tooltip/Tooltip";

export const ModalHeader: React.FC<ModalHeaderProps> = ({
    allowDrag,
    minimized,
    onClose,
    onGoHome,
    onMinimize,
    onSettings,
}) => {
    return (
        <div>
            {onGoHome ? (
                <HomeButton text={"Home"} placement={"right"}>
                    <HomeIcon onClick={onGoHome} />
                </HomeButton>
            ) : null}
            {onSettings ? (
                <SettingsButton text={"Settings"} placement={"right"}>
                    <SettingsIcon onClick={onSettings} />
                </SettingsButton>
            ) : null}
            {allowDrag ? (
                <DragButton text={"Move window"}>
                    <DragIndicatorIcon />
                </DragButton>
            ) : null}
            {onClose ? (
                <CloseButton text={"Exit tutorial"}>
                    <CloseIcon onClick={onClose} />
                </CloseButton>
            ) : null}
            {onMinimize && minimized ? (
                <ExpandButton text={"Expand window"}>
                    <AddIcon onClick={onMinimize} />
                </ExpandButton>
            ) : onMinimize ? (
                <MinimizeButton text={"Minimize window"}>
                    <MinimizeIcon onClick={onMinimize} />
                </MinimizeButton>
            ) : null}
        </div>
    );
};

export interface ModalHeaderProps {
    allowDrag?: boolean;
    minimized?: boolean;
    onClose?: () => void;
    onGoHome?: () => void;
    onMinimize?: () => void;
    onSettings?: () => void;
}

const DragButton = styled(Tooltip)`
    position: absolute;
    left: 50%;
    cursor: pointer;

    svg {
        font-size: 24px !important;
        font-weight: bold;

        -webkit-transform: rotate(90deg);
        -moz-transform: rotate(90deg);
        -ms-transform: rotate(90deg);
        -o-transform: rotate(90deg);
        transform: rotate(90deg);
    }

    ${TooltipText} {
        top: -2px;
    }
`;

const CloseButton = styled(Tooltip)`
    float: right;
    cursor: pointer;

    svg {
        font-size: 20px !important;
        font-weight: bold;
        margin-right: 8px;
    }
`;

const HomeButton = styled(Tooltip)`
    float: left;
    cursor: pointer;

    svg {
        font-size: 20px !important;
        font-weight: bold;
        margin-right: 8px;
    }

    ${TooltipWrapper}: {
        float: right;
    }
`;

const MinimizeButton = styled(Tooltip)`
    float: right;
    cursor: pointer;

    svg {
        font-size: 18px !important;
        font-weight: bold;
    }

    ${TooltipText} {
        top: -10px;
    }
`;

const ExpandButton = styled(Tooltip)`
    float: right;
    cursor: pointer;

    svg {
        font-size: 18px !important;
        font-weight: bold;
    }
`;

const SettingsButton = styled(Tooltip)`
    float: left;
    cursor: pointer;

    svg {
        font-size: 20px !important;
        font-weight: bold;
        margin-right: 8px;
    }

    ${TooltipWrapper}: {
        float: right;
    }
`;
