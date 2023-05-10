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
    setSelectionLigand,
    getSelectedLigand,
} from "../../view-models/Selection";
import { Dropdown, DropdownProps } from "../dropdown/Dropdown";
import { ModelSearch, ModelSearchProps } from "../model-search/ModelSearch";

import "./ViewerSelector.css";
import { SelectionItem } from "./SelectionItem";
import { useUpdateActions } from "../../hooks/use-update-actions";
import classnames from "classnames";
import { PdbInfo } from "../../../domain/entities/PdbInfo";
import { sendAnalytics } from "../../utils/analytics";
import { UploadData } from "../../../domain/entities/UploadData";
import { Maybe } from "../../../utils/ts-utils";

interface ViewerSelectorProps {
    pdbInfo: PdbInfo | undefined;
    selection: Selection;
    onSelectionChange(newSelection: Selection): void;
    uploadData: Maybe<UploadData>;
}

const actions = { setOverlayItemVisibility, removeOverlayItem, setMainItemVisibility };

export const ViewerSelector: React.FC<ViewerSelectorProps> = props => {
    const { selection, onSelectionChange, uploadData } = props;
    const chainDropdownProps = useChainDropdown(props);
    const ligandsDropdownProps = useLigandsDropdown(props);

    const [isSearchOpen, { open: openSearch, close: closeSearch }] = useBooleanState(false);

    const update = useUpdateActions(onSelectionChange, actions);

    const runModelSearchAction = React.useCallback<ModelSearchProps["onSelect"]>(
        (action, item) => {
            const newSelection = runAction(selection, action, item);
            sendAnalytics(action, { type: "viewer_search_menu", item: item.id });
            onSelectionChange(newSelection);
            closeSearch();
        },
        [selection, closeSearch, onSelectionChange]
    );

    const openSearchWithAnalytics = React.useCallback(() => {
        openSearch();
        sendAnalytics("open_dialog", {
            label: "Search",
        });
    }, [openSearch]);

    return (
        <div id="viewer-selector">
            <div className="db">
                <div className="status">
                    {uploadData && <div>{uploadData.title}</div>}

                    {selection.type === "free" && (
                        <>
                            {selection.main.pdb && (
                                <MainItemBox label={i18n.t("PDB")}>
                                    <SelectionItem
                                        selection={selection}
                                        item={selection.main?.pdb}
                                        onVisibilityChange={update.setMainItemVisibility}
                                    />
                                </MainItemBox>
                            )}

                            {selection.main.emdb && (
                                <MainItemBox label={i18n.t("EMDB")} className="emdb">
                                    <SelectionItem
                                        selection={selection}
                                        item={selection.main.emdb}
                                        onVisibilityChange={update.setMainItemVisibility}
                                    />
                                </MainItemBox>
                            )}
                        </>
                    )}
                </div>

                <div className="selection">
                    {selection.type === "free" &&
                        selection.overlay.map(item => (
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
                <button onClick={openSearchWithAnalytics}>
                    <Search />
                </button>
                <Dropdown {...chainDropdownProps} showExpandIcon />
                <Dropdown {...ligandsDropdownProps} showExpandIcon />
            </div>

            {isSearchOpen && (
                <ModelSearch
                    title={i18n.t("Select or append a new model")}
                    onClose={closeSearch}
                    onSelect={runModelSearchAction}
                />
            )}
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

    const items: DropdownProps["items"] = React.useMemo(
        () => pdbInfo?.chains.map(chain => ({ id: chain.chainId, text: chain.name })),
        [pdbInfo]
    );

    const selectedChain = getSelectedChain(pdbInfo, selection);

    const text = selectedChain
        ? `${i18n.t("Chain")}: ${selectedChain.shortName}`
        : i18n.t("Chains");

    return { text, items, selected: selectedChain?.chainId, onClick: setChain };
}

export function getSelectedChain(pdbInfo: PdbInfo | undefined, selection: Selection) {
    const chains = pdbInfo?.chains || [];
    const selectedChain = chains.find(chain => chain.chainId === selection.chainId) || chains[0];
    return selectedChain;
}

function useLigandsDropdown(options: ViewerSelectorProps): DropdownProps {
    const { pdbInfo, selection, onSelectionChange } = options;

    const setLigand = React.useCallback(
        (ligandId: Maybe<string>) => {
            const selectedLigand = getSelectedLigand({ ...selection, ligandId }, pdbInfo);
            onSelectionChange(setSelectionLigand(selection, selectedLigand));
        },
        [selection, onSelectionChange, pdbInfo]
    );

    const selectedChain = getSelectedChain(pdbInfo, selection);

    const items: DropdownProps["items"] = React.useMemo(() => {
        return pdbInfo?.ligands
            .filter(ligand => ligand.shortChainId === selectedChain?.chainId)
            .map(ligand => ({ id: ligand.shortId, text: ligand.shortId }));
    }, [selectedChain, pdbInfo]);

    const selectedLigand = getSelectedLigand(selection, pdbInfo);

    const text = selectedLigand
        ? `${i18n.t("Ligand")}: ${selectedLigand.shortId}`
        : i18n.t("Ligands");

    return {
        text,
        items,
        onClick: setLigand,
        selected: selectedLigand?.shortId,
        deselectable: true,
    };
}
