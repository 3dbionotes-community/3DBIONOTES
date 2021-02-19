import React from "react";
import { IconButton } from "@material-ui/core";
import _ from "lodash";
import { Close, Search, Visibility, VisibilityOff } from "@material-ui/icons";

import { useBooleanState } from "../../hooks/use-boolean";
import i18n from "../../utils/i18n";
import {
    DbItem,
    removeOverlayItem,
    SelectionState,
    setOverlayItemVisibility,
    updateMainItemVisibility,
} from "../../view-models/SelectionState";
import { Dropdown, DropdownProps } from "../dropdown/Dropdown";
import { ModelSearch } from "../model-search/ModelSearch";

import "./ViewerSelector.css";

interface ViewerSelectorProps {
    selection: SelectionState;
    onSelectionChange(newSelection: SelectionState): void;
}

export const ViewerSelector: React.FC<ViewerSelectorProps> = props => {
    const { selection, onSelectionChange } = props;

    const chainItems: DropdownProps["items"] = [
        { id: "A", text: "Chain A" },
        { id: "B", text: "Chain B" },
    ];

    const ligandItems: DropdownProps["items"] = [
        { id: "L1", text: "Ligand 1" },
        { id: "L2", text: "Ligand 2" },
    ];

    const [isSearchOpen, { enable: openSearch, disable: closeSearch }] = useBooleanState(false);

    const notifyOverlayItemVisibilityChange = React.useCallback(
        (id: string, visible: boolean) =>
            onSelectionChange(setOverlayItemVisibility(selection, id, visible)),
        [onSelectionChange, selection]
    );

    const notifyOverlayItemRemoval = React.useCallback(
        (id: string) => onSelectionChange(removeOverlayItem(selection, id)),
        [onSelectionChange, selection]
    );

    const notifyMainItemVisibilityChange = React.useCallback(
        (id: string, visible: boolean) =>
            onSelectionChange(updateMainItemVisibility(selection, id, visible)),
        [onSelectionChange, selection]
    );

    return (
        <div id="viewer-selector">
            <div className="db">
                <div className="status">
                    {selection.main && (
                        <MainItemBox label={i18n.t("PDB")}>
                            <SelectionItem
                                item={selection.main.pdb}
                                onVisibilityChange={notifyMainItemVisibilityChange}
                            />
                        </MainItemBox>
                    )}

                    {selection.main && selection.main.emdb && (
                        <MainItemBox label={i18n.t("EMDB")}>
                            <SelectionItem
                                item={selection.main.emdb}
                                onVisibilityChange={notifyMainItemVisibilityChange}
                            />
                        </MainItemBox>
                    )}

                    <button onClick={openSearch}>
                        <Search /> {i18n.t("Search")}
                    </button>

                    {isSearchOpen && (
                        <ModelSearch
                            title={i18n.t("Select or append a new model")}
                            onClose={closeSearch}
                        />
                    )}
                </div>

                <div className="selection">
                    {selection.overlay.map(item => (
                        <SelectionItem
                            key={item.id}
                            item={item}
                            onVisibilityChange={notifyOverlayItemVisibilityChange}
                            onRemove={notifyOverlayItemRemoval}
                        />
                    ))}
                </div>
            </div>

            <div className="selectors">
                <Dropdown
                    text={i18n.t("Chains")}
                    items={chainItems}
                    onClick={console.debug}
                    showExpandIcon
                />
                <Dropdown
                    text={i18n.t("Ligands")}
                    items={ligandItems}
                    onClick={console.debug}
                    showExpandIcon
                />
            </div>
        </div>
    );
};

const MainItemBox: React.FC<{ label: string }> = props => {
    const { label, children } = props;

    return (
        <div className="db-item">
            <div className="label">{label}</div>
            <div className="content">{children}</div>
        </div>
    );
};

const SelectionItem: React.FC<{
    item: DbItem;
    onVisibilityChange(id: DbItem["id"], visible: boolean): void;
    onRemove?(id: DbItem["id"]): void;
}> = props => {
    const { item, onVisibilityChange, onRemove } = props;

    const notifyClick = React.useCallback(() => {
        onVisibilityChange(item.id, !item.visible);
    }, [item, onVisibilityChange]);

    const notifyRemove = React.useCallback(() => {
        if (onRemove) onRemove(item.id);
    }, [item.id, onRemove]);

    return (
        <div className={item.visible ? "selected" : "unselected"}>
            <IconButton onClick={notifyClick}>
                {item.visible ? <Visibility /> : <VisibilityOff />}
            </IconButton>

            <span className="id">{item.id}</span>

            {onRemove && (
                <IconButton onClick={notifyRemove}>
                    <Close />
                </IconButton>
            )}
        </div>
    );
};
