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
import { SelectionItem } from "./SelectionItem";
import { useUpdateActions } from "../../hooks/use-update-actions";
import { PdbInfo } from "../../../domain/entities/PdbInfo";
import { sendAnalytics } from "../../utils/analytics";
import { UploadData } from "../../../domain/entities/UploadData";
import { Maybe } from "../../../utils/ts-utils";
import "./ViewerSelector.css";

interface ViewerSelectorProps {
    pdbInfo: PdbInfo | undefined;
    selection: Selection;
    onSelectionChange(newSelection: Selection): void;
    uploadData: Maybe<UploadData>;
    expanded?: boolean;
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
                        <div className="selection-main-container">
                            {selection.main.pdb && (
                                <SelectionItem
                                    label={i18n.t("PDB")}
                                    type="main"
                                    selection={selection}
                                    item={selection.main?.pdb}
                                    onVisibilityChange={update.setMainItemVisibility}
                                />
                            )}

                            {selection.main.emdb && (
                                <SelectionItem
                                    label={i18n.t("EMDB")}
                                    type="main"
                                    selection={selection}
                                    item={selection.main.emdb}
                                    onVisibilityChange={update.setMainItemVisibility}
                                />
                            )}
                        </div>
                    )}
                </div>
                <div className="selectors">
                    <button onClick={openSearchWithAnalytics}>
                        <Search />
                    </button>
                    <Dropdown {...chainDropdownProps} showExpandIcon />
                    <Dropdown {...ligandsDropdownProps} showExpandIcon />
                </div>
            </div>

            <div className="selection">
                {selection.type === "free" &&
                    selection.overlay.map(item => (
                        <SelectionItem
                            key={item.id}
                            type="overlay"
                            selection={selection}
                            item={item}
                            onVisibilityChange={update.setOverlayItemVisibility}
                            onRemove={update.removeOverlayItem}
                        />
                    ))}
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

function useChainDropdown(options: ViewerSelectorProps): DropdownProps {
    const { pdbInfo, selection, onSelectionChange, expanded } = options;

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

    const selectedChain = getSelectedChain(pdbInfo?.chains, selection);

    const text = expanded
        ? selectedChain
            ? `${i18n.t("Chain")}: ${selectedChain.shortName}`
            : i18n.t("Chains")
        : "C";

    return { text, items, selected: selectedChain?.chainId, onClick: setChain };
}

export function getSelectedChain(chains: PdbInfo["chains"] | undefined, selection: Selection) {
    return chains?.find(chain => chain.chainId === selection.chainId) || chains?.[0];
}

function useLigandsDropdown(options: ViewerSelectorProps): DropdownProps {
    const { pdbInfo, selection, onSelectionChange, expanded } = options;

    const setLigand = React.useCallback(
        (ligandId: Maybe<string>) => {
            const selectedLigand = getSelectedLigand({ ...selection, ligandId }, pdbInfo);
            onSelectionChange(setSelectionLigand(selection, selectedLigand));
        },
        [selection, onSelectionChange, pdbInfo]
    );

    const selectedChain = getSelectedChain(pdbInfo?.chains, selection);

    const items: DropdownProps["items"] = React.useMemo(() => {
        return pdbInfo?.ligands
            .filter(ligand => ligand.shortChainId === selectedChain?.chainId)
            .map(ligand => ({ id: ligand.shortId, text: ligand.shortId }));
    }, [selectedChain, pdbInfo]);

    const selectedLigand = getSelectedLigand(selection, pdbInfo);

    const text = expanded
        ? selectedLigand
            ? `${i18n.t("Ligand")}: ${selectedLigand.shortId}`
            : i18n.t("Ligands")
        : "L";

    return {
        text,
        items,
        onClick: setLigand,
        selected: selectedLigand?.shortId,
        deselectable: true,
    };
}
