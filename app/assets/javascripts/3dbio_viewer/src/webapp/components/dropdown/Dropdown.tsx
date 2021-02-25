import React from "react";
import _ from "lodash";
import { MenuItem } from "@material-ui/core";
import { useBooleanState } from "../../hooks/use-boolean";
import { PopperMenu } from "./PopperMenu";
import Done from "@material-ui/icons/Done";
import { ExpandMore } from "@material-ui/icons";

export interface DropdownProps<Id extends string = string> {
    text: string;
    value?: Id;
    items: DropdownItemModel<Id>[];
    onClick(id: Id): void;
    showSelection?: boolean;
    showExpandIcon?: boolean;
}

export interface DropdownItemModel<Id extends string> {
    id: Id;
    text: string;
    selected?: boolean;
}

export function Dropdown<Id extends string = string>(props: DropdownProps<Id>): React.ReactElement {
    const { items, text, onClick, showExpandIcon = false, value } = props;
    const [isMenuOpen, { enable: openMenu, disable: closeMenu }] = useBooleanState(false);
    const buttonRef = React.useRef(null);
    const showSelection = props.showSelection ?? _(items).some(item => item.selected !== undefined);

    const runOnClickAndCloseMenu = React.useCallback(
        (id: string) => {
            onClick(id as Id);
            closeMenu();
        },
        [onClick, closeMenu]
    );

    const buttonText = value !== undefined ? items.find(item => item.id === value)?.text : text;

    return (
        <React.Fragment>
            <button ref={buttonRef} onClick={openMenu} className={isMenuOpen ? "open" : "close"}>
                {buttonText}
                {showExpandIcon && <ExpandMore />}
            </button>

            <PopperMenu isOpen={isMenuOpen} close={closeMenu} buttonRef={buttonRef}>
                {items.map(item => (
                    <DropdownItem<Id>
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
}

interface MenuItemProps<Id extends string> {
    isSelected: boolean;
    item: DropdownItemModel<Id>;
    onClick(id: Id): void;
    showSelection: boolean;
}

function DropdownItem<Id extends string>(
    props: React.PropsWithChildren<MenuItemProps<Id>>
): React.ReactElement {
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
}

const styles = {
    menuItemSelected: {
        marginLeft: 24,
    },
};
