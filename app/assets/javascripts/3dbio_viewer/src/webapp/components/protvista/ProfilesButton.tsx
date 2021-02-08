import React from "react";
import { ClickAwayListener, Grow, MenuItem, MenuList, Paper, Popper } from "@material-ui/core";
import { useBooleanState } from "../../hooks/use-boolean";
import i18n from "../../utils/i18n";
import Done from "@material-ui/icons/Done";

export interface ProfilesButtonProps {
    text?: string;
    items: Item[];
}

interface Item {
    id: string;
    text: string;
}

export const ProfilesButton: React.FC<ProfilesButtonProps> = props => {
    const { items, text: buttonText = i18n.t("Profiles") } = props;
    const [isMenuOpen, { enable: openMenu, disable: closeMenu }] = useBooleanState(false);
    const buttonRef = React.useRef(null);

    return (
        <React.Fragment>
            <button ref={buttonRef} onClick={openMenu} className={isMenuOpen ? "open" : "close"}>
                {buttonText}
            </button>

            <PopperMenu isOpen={isMenuOpen} close={closeMenu} buttonRef={buttonRef}>
                {items.map((item, index) => (
                    <ProfileMenuItem key={item.id} item={item} isSelected={index === 0} />
                ))}
            </PopperMenu>
        </React.Fragment>
    );
};

interface PropperMenuProps {
    isOpen: boolean;
    close(): void;
    buttonRef: React.MutableRefObject<any>;
}

const PopperMenu: React.FC<PropperMenuProps> = props => {
    const { isOpen, close, children, buttonRef } = props;
    const growStyles = styles.grow.placement;

    return (
        <Popper
            open={isOpen}
            anchorEl={buttonRef.current}
            className="menu"
            style={{ zIndex: 10000 }}
            transition
            disablePortal
        >
            {({ TransitionProps, placement }) => (
                <Grow
                    {...TransitionProps}
                    style={placement === "bottom" ? growStyles.bottom : growStyles.other}
                >
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

interface AnchorItemProps {
    item: Item;
    isSelected: boolean;
    onClick?(id: string): void;
}

const ProfileMenuItem: React.FC<AnchorItemProps> = props => {
    const { item, onClick, isSelected } = props;
    const notify = React.useCallback(() => {
        if (onClick) onClick(item.id);
    }, [item, onClick]);

    return (
        <MenuItem onClick={notify} className="menu-item">
            {isSelected && <Done />}
            <span style={isSelected ? undefined : styles.menuItemSelected}>{item.text}</span>
        </MenuItem>
    );
};

const styles = {
    grow: {
        placement: {
            bottom: { transformOrigin: "center top" },
            other: { transformOrigin: "center bottom" },
        },
    },
    menuItemSelected: {
        marginLeft: 24,
    },
};
