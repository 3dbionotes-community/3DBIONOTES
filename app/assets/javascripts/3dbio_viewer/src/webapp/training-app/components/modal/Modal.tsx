import React, { useCallback, useEffect, useState } from "react";
import Draggable, {
    ControlPosition,
    DraggableData,
    DraggableEvent,
    DraggableProps,
} from "react-draggable";
import styled from "styled-components";
import { ModalHeader, ModalHeaderProps } from "./ModalHeader";

export const Modal: React.FC<ModalProps> = ({
    className,
    children,
    onClose,
    onMinimize,
    onGoHome,
    onSettings,
    minimized,
    allowDrag,
    centerChildren,
}) => {
    const [position, setPosition] = useState<ControlPosition>();
    const dragId = "drag-button";

    const clearPosition = useCallback((_event: DraggableEvent, { x, y }: DraggableData) => {
        setPosition({ x, y });
    }, []);

    useEffect(() => {
        setPosition({ x: 0, y: 0 });
    }, [minimized]);

    return (
        <StyledDraggable
            disabled={!allowDrag}
            handle={`#${dragId}`}
            position={position}
            onDrag={clearPosition}
        >
            <ModalWrapper center={centerChildren}>
                <ModalBody id={dragId} className={className}>
                    <ModalHeader
                        minimized={minimized}
                        onClose={onClose}
                        onGoHome={onGoHome}
                        onSettings={onSettings}
                        onMinimize={onMinimize}
                        allowDrag={allowDrag}
                    />
                    {children}
                </ModalBody>
            </ModalWrapper>
        </StyledDraggable>
    );
};

export interface ModalProps extends ModalHeaderProps {
    className?: string;
    centerChildren?: boolean;
}

const ModalWrapper = styled.div<{ center?: boolean }>`
    justify-content: center;
    align-items: center;
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    text-align: ${props => (props.center ? "center" : "unset")};
    user-select: none;
    z-index: 999999;
`;

export const ModalBody = styled.div`
    background-color: #133546;
    border-radius: 18px;
    padding: 18px;
    font-family: "Roboto", sans-serif;
    color: #fff;
    pointer-events: auto;
    box-shadow: 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12),
        0 5px 5px -3px rgba(0, 0, 0, 0.2);
`;

const CustomDraggable: React.FC<Partial<DraggableProps> & { className?: string }> = ({
    className,
    children,
    ...rest
}) => {
    return (
        <Draggable {...rest} defaultClassName={className}>
            {children}
        </Draggable>
    );
};

const StyledDraggable = styled(CustomDraggable)`
    /* Required to allow clicks on items behind draggable region */
    pointer-events: none;

    /* Required to not loose dragging focus if cursor goes outside of draggable region */
    :active {
        pointer-events: all;
    }
`;
