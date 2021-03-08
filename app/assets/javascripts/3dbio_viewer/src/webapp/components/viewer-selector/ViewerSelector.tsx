import React from "react";
import _ from "lodash";
import { Search } from "@material-ui/icons";

import { useBooleanState } from "../../hooks/use-boolean";
import i18n from "../../utils/i18n";
import {
    removeOverlayItem,
    SelectionState,
    setOverlayItemVisibility,
    setMainItemVisibility,
    runAction,
} from "../../view-models/SelectionState";
import { Dropdown, DropdownProps } from "../dropdown/Dropdown";
import { ModelSearch, ModelSearchProps } from "../model-search/ModelSearch";

import "./ViewerSelector.css";
import { SelectionItem } from "./SelectionItem";
import { useUpdateActions } from "../../hooks/use-update-actions";
import classnames from "classnames";

interface ViewerSelectorProps {
    selection: SelectionState;
    onSelectionChange(newSelection: SelectionState): void;
}

const actions = { setOverlayItemVisibility, removeOverlayItem, setMainItemVisibility };

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

    const update = useUpdateActions(onSelectionChange, actions);

    const runModelSearchAction = React.useCallback<ModelSearchProps["onSelect"]>(
        (action, item) => {
            const newSelection = runAction(selection, action, item);
            onSelectionChange(newSelection);
            closeSearch();
        },
        [selection, closeSearch, onSelectionChange]
    );

    return (
        <div id="viewer-selector">
            <div className="db">
                <div className="status">
                    {selection.main && (
                        <MainItemBox label={i18n.t("PDB")}>
                            <SelectionItem
                                selection={selection}
                                item={selection.main.pdb}
                                onVisibilityChange={update.setMainItemVisibility}
                            />
                        </MainItemBox>
                    )}

                    {selection.main && selection.main.emdb && (
                        <MainItemBox label={i18n.t("EMDB")} className="emdb">
                            <SelectionItem
                                selection={selection}
                                item={selection.main.emdb}
                                onVisibilityChange={update.setMainItemVisibility}
                            />
                        </MainItemBox>
                    )}

                    <button onClick={openSearch}>
                        <Search />
                    </button>

                    {isSearchOpen && (
                        <ModelSearch
                            title={i18n.t("Select or append a new model")}
                            onClose={closeSearch}
                            onSelect={runModelSearchAction}
                        />
                    )}
                </div>

                <div className="selection">
                    {selection.overlay.map(item => (
                        <SelectionItem
                            key={item.id}
                            selection={selection}
                            item={item}
                            onVisibilityChange={update.setOverlayItemVisibility}
                            onRemove={update.removeOverlayItem}
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

const MainItemBox: React.FC<{ label: string; className?: string }> = props => {
    const { label, className, children } = props;

    return (
        <div className={classnames("db-item", className)}>
            <div className="label">{label}</div>
            <div className="content">{children}</div>
        </div>
    );
};
