import React from "react";
import { ClickAwayListener, Grow, MenuList, Paper, Popper } from "@material-ui/core";

export interface PropperMenuProps {
    isOpen: boolean;
    close(): void;
    buttonRef: React.MutableRefObject<any>;
}

export const PopperMenu: React.FC<PropperMenuProps> = props => {
    const { isOpen, close, children, buttonRef } = props;
    const growStyles = styles.grow.placement;

    return (
        <Popper
            open={isOpen}
            anchorEl={buttonRef.current}
            className="menu"
            transition
            disablePortal
        >
            {({ TransitionProps, placement }) => (
                <Grow {...TransitionProps} style={growStyles.bottom}>
                    <Paper className="wrapper">
                        <ClickAwayListener onClickAway={close}>
                            <MenuList autoFocusItem={isOpen} className="menu-list">
                                {children}
                            </MenuList>
                        </ClickAwayListener>
                    </Paper>
                </Grow>
            )}
        </Popper>
    );
};

const styles = {
    grow: {
        placement: {
            bottom: { transformOrigin: "center top" },
            other: { transformOrigin: "center bottom" },
        },
    },
};
