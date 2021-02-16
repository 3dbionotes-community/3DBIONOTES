import React from "react";
import _ from "lodash";
import { MenuItem } from "@material-ui/core";
import { useBooleanState } from "../../hooks/use-boolean";
import { PopperMenu } from "./PopperMenu";
import Done from "@material-ui/icons/Done";
import { ExpandMore } from "@material-ui/icons";

export interface DropdownProps {
    text: string;
    items: DropdownItemModel[];
    onClick(id: string): void;
    showSelection?: boolean;
    showExpandIcon?: boolean;
}

export interface DropdownItemModel {
    id: string;
    text: string;
    selected?: boolean;
}

export const Dropdown: React.FC<DropdownProps> = props => {
    const { items, text, onClick, showExpandIcon = false } = props;
    const [isMenuOpen, { enable: openMenu, disable: closeMenu }] = useBooleanState(false);
    const buttonRef = React.useRef(null);
    const showSelection = props.showSelection ?? _(items).some(item => item.selected !== undefined);

    const runOnClickAndCloseMenu = React.useCallback(
        (id: string) => {
            onClick(id);
            closeMenu();
        },
        [onClick, closeMenu]
    );

    return (
        <React.Fragment>
            <button ref={buttonRef} onClick={openMenu} className={isMenuOpen ? "open" : "close"}>
                {text}
                {showExpandIcon && <ExpandMore />}
            </button>

            <PopperMenu isOpen={isMenuOpen} close={closeMenu} buttonRef={buttonRef}>
                {items.map(item => (
                    <DropdownItem
                        key={item.id}
                        onClick={runOnClickAndCloseMenu}
                        item={item}
                        isSelected={item.selected ?? false}
                        showSelection={showSelection}
                    >
                        {item.text}
                    </DropdownItem>
                ))}
            </PopperMenu>
        </React.Fragment>
    );
};

interface MenuItemProps {
    isSelected: boolean;
    item: DropdownItemModel;
    onClick(id: string): void;
    showSelection: boolean;
}

const DropdownItem: React.FC<MenuItemProps> = props => {
    const { item, onClick, isSelected, showSelection } = props;
    const runOnClick = React.useCallback(() => onClick(item.id), [item.id, onClick]);

    return (
        <MenuItem onClick={runOnClick} className="menu-item">
            {showSelection ? (
                <React.Fragment>
                    {isSelected && <Done />}

                    <span style={isSelected ? undefined : styles.menuItemSelected}>
                        {item.text}
                    </span>
                </React.Fragment>
            ) : (
                <span>{item.text}</span>
            )}
        </MenuItem>
    );
};

const styles = {
    menuItemSelected: {
        marginLeft: 24,
    },
};
