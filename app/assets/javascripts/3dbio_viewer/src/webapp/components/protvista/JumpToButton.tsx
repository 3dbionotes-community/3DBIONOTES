import React from "react";
import { ClickAwayListener, Grow, MenuItem, MenuList, Paper, Popper } from "@material-ui/core";
import { useBooleanState } from "../../hooks/use-boolean";
import i18n from "../../utils/i18n";

interface JumpToButtonProps {}

export const JumpToButton: React.FC<JumpToButtonProps> = () => {
    const jumpToButtonRef = React.useRef(null);
    const [isMenuOpen, { enable: openMenu, disable: closeMenu }] = useBooleanState(false);

    return (
        <>
            <button ref={jumpToButtonRef} onClick={openMenu}>
                {i18n.t("Jump to")}
            </button>

            <Popper
                open={isMenuOpen}
                anchorEl={jumpToButtonRef.current}
                role={undefined}
                transition
                disablePortal
                className="jump-to-menu"
            >
                {({ TransitionProps, placement }) => (
                    <Grow
                        {...TransitionProps}
                        style={{
                            transformOrigin:
                                placement === "bottom" ? "center top" : "center bottom",
                        }}
                    >
                        <Paper className="wrapper">
                            <ClickAwayListener onClickAway={closeMenu}>
                                <MenuList autoFocusItem={isMenuOpen} className="menu-list">
                                    <MenuItem onClick={closeMenu}>
                                        {i18n.t("Structural information")}
                                    </MenuItem>
                                    <MenuItem onClick={closeMenu}>
                                        {i18n.t("Map validation")}
                                    </MenuItem>
                                    <MenuItem onClick={closeMenu}>{i18n.t("PPI viewer")}</MenuItem>
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
            </Popper>
        </>
    );
};
