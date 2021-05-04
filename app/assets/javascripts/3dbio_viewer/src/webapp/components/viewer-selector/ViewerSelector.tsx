import React from "react";
import _ from "lodash";
import { Search } from "@material-ui/icons";

import { useBooleanState } from "../../hooks/use-boolean";
import i18n from "../../utils/i18n";
import {
    removeOverlayItem,
    Selection,
    setOverlayItemVisibility,
    setMainItemVisibility,
    runAction,
    setSelectionChain,
} from "../../view-models/Selection";
import { Dropdown, DropdownProps } from "../dropdown/Dropdown";
import { ModelSearch, ModelSearchProps } from "../model-search/ModelSearch";

import "./ViewerSelector.css";
import { SelectionItem } from "./SelectionItem";
import { useUpdateActions } from "../../hooks/use-update-actions";
import classnames from "classnames";
import { PdbInfo } from "../../../domain/entities/PdbInfo";

interface ViewerSelectorProps {
    pdbInfo: PdbInfo | undefined;
    selection: Selection;
    onSelectionChange(newSelection: Selection): void;
}

const actions = { setOverlayItemVisibility, removeOverlayItem, setMainItemVisibility };

export const ViewerSelector: React.FC<ViewerSelectorProps> = props => {
    const { selection, onSelectionChange } = props;
    const chainDropdownProps = useChainDropdown(props);

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
                    {selection.main && selection.main.pdb && (
                        <MainItemBox label={i18n.t("PDB")}>
                            <SelectionItem
                                selection={selection}
                                item={selection.main?.pdb}
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
                <Dropdown {...chainDropdownProps} showExpandIcon />

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

function useChainDropdown(options: ViewerSelectorProps): DropdownProps {
    const { pdbInfo, selection, onSelectionChange } = options;

    const setChain = React.useCallback(
        (chainId: string) => {
            onSelectionChange(setSelectionChain(selection, chainId));
        },
        [selection, onSelectionChange]
    );

    const chainItems: DropdownProps["items"] = React.useMemo(
        () => pdbInfo?.chains.map(chain => ({ id: chain.chainId, text: chain.name })),
        [pdbInfo]
    );

    const chains = pdbInfo?.chains || [];
    const selectedChain = chains.find(chain => chain.chainId === selection.chainId) || chains[0];

    const chainText = [i18n.t("Chain"), selectedChain?.shortName || "-"].join(" ");

    return { text: chainText, items: chainItems, onClick: setChain };
}
