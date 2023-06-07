import _ from "lodash";
import React from "react";
import { MenuItem } from "@material-ui/core";
import { ExpandMore, ExpandLess, Done } from "@material-ui/icons";
import { useBooleanState } from "../../hooks/use-boolean";
import { PopperMenu } from "./PopperMenu";
import i18n from "../../utils/i18n";
import { StyledButton } from "../../training-app/components/action-button/ActionButton";
import styled from "styled-components";
import { Maybe } from "../../../utils/ts-utils";

export interface DropdownProps<Id extends string = string> {
    // Show text or, if empty, the selected item.
    items: DropdownItemModel<Id>[] | undefined;
    text?: string;
    selected?: Id | undefined;
    onClick(id: Maybe<Id>): void;
    showSelection?: boolean;
    showExpandIcon?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    deselectable?: boolean;
}

export interface DropdownItemModel<Id extends string> {
    id: Id;
    text: string;
}

export function Dropdown<Id extends string = string>(
    props: DropdownProps<Id>
): React.ReactElement | null {
    const { items, text, onClick, showExpandIcon = false, selected, rightIcon, leftIcon } = props;
    const { deselectable } = props;
    const [isMenuOpen, { enable: openMenu, disable: closeMenu }] = useBooleanState(false);
    const buttonRef = React.useRef(null);
    const showSelection = Boolean(selected);

    const runOnClickAndCloseMenu = React.useCallback(
        (id: string) => {
            onClick(id as Id);
            closeMenu();
        },
        [onClick, closeMenu]
    );

    const deselect = React.useCallback<React.MouseEventHandler>(
        ev => {
            ev.stopPropagation();
            onClick(undefined);
        },
        [onClick]
    );

    if (!items || _.isEmpty(items)) return null;

    const buttonText =
        text || (selected !== undefined ? items.find(item => item.id === selected)?.text : ""); //"" intended to remove text

    return (
        <React.Fragment>
            <StyledButton
                ref={buttonRef}
                onClick={openMenu}
                className={isMenuOpen ? "open" : undefined}
            >
                {leftIcon}
                {selected && deselectable && <InnerButton onClick={deselect}>✕</InnerButton>}
                {buttonText}
                {rightIcon}
                {showExpandIcon && (isMenuOpen ? <ExpandLess /> : <ExpandMore />)}
            </StyledButton>

            <PopperMenu isOpen={isMenuOpen} close={closeMenu} buttonRef={buttonRef}>
                {items.map(item => (
                    <DropdownItem<Id>
                        key={item.id}
                        onClick={runOnClickAndCloseMenu}
                        item={item}
                        isSelected={item.id === selected}
                        showSelection={showSelection}
                    >
                        {item.text}
                    </DropdownItem>
                ))}
            </PopperMenu>
        </React.Fragment>
    );
}

const InnerButton = styled.button`
    margin: 0;
    padding: 0;
    &:hover {
        background-color: #aae;
    }
`;

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

                    <span style={isSelected ? styles.selected : styles.menuItemSelected}>
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
    selected: {
        marginLeft: 8,
    },
    menuItemSelected: {
        marginLeft: 32,
    },
};
