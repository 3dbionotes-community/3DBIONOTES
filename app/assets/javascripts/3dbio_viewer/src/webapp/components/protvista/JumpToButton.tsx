import React from "react";
import { ClickAwayListener, Grow, MenuItem, MenuList, Paper, Popper } from "@material-ui/core";
import { useBooleanState } from "../../hooks/use-boolean";
import i18n from "../../utils/i18n";

export interface JumpToButtonProps {
    text?: string;
    items: AnchorItem[];
}

interface AnchorItem {
    id: string;
    text: string;
}

export const JumpToButton: React.FC<JumpToButtonProps> = props => {
    const { items, text: buttonText = i18n.t("Jump to") } = props;
    const [isMenuOpen, { enable: openMenu, disable: closeMenu }] = useBooleanState(false);
    const buttonRef = React.useRef(null);

    const goToAnchor = React.useCallback(
        (id: string) => {
            goToElement(id);
            closeMenu();
        },
        [closeMenu]
    );

    return (
        <React.Fragment>
            <button ref={buttonRef} onClick={openMenu} className={isMenuOpen ? "open" : "close"}>
                {buttonText}
            </button>

            <PopperMenu isOpen={isMenuOpen} close={closeMenu} buttonRef={buttonRef}>
                {items.map(item => (
                    <AnchorItem key={item.id} goToAnchor={goToAnchor} item={item}>
                        {item.text}
                    </AnchorItem>
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
            className="jump-to-menu"
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
    item: AnchorItem;
    goToAnchor(id: string): void;
}

const AnchorItem: React.FC<AnchorItemProps> = props => {
    const { item, goToAnchor } = props;
    const goToAnchorItem = React.useCallback(() => {
        return goToAnchor(item.id);
    }, [item, goToAnchor]);

    return (
        <MenuItem onClick={goToAnchorItem} className="menu-item">
            {item.text}
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
};

function goToElement(elDomId: string) {
    // Use document.getElementById for simplicity. The alternative would be to setup refs in the
    // parent component and pass them here and to all components that have an anchor.
    const el = document.getElementById(elDomId);
    if (el) el.scrollIntoView({ behavior: "smooth" });
}
