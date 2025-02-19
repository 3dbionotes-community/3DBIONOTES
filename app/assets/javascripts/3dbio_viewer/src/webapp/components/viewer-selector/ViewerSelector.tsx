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
import { ebiStyles } from "../ViewerBlock";
import styled from "styled-components";

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

    const overlayItems = React.useMemo(
        () => selection.type === "free" && [...selection.overlay, ...selection.refinedModels],
        [selection]
    );

    return (
        <div id="viewer-selector">
            {uploadData && uploadData.title && (
                <div className="viewer-selector-title">
                    <div className="overline">{i18n.t("Job Title")}</div>
                    {uploadData.title}
                </div>
            )}
            <div className="db">
                {selection.type === "free" && (
                    <div className="status">
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
                    </div>
                )}

                <div className={"selectors" + (uploadData ? " invert" : "")}>
                    <StyledButton
                        onClick={openSearchWithAnalytics}
                        title={i18n.t("Select or append a new model")}
                        disabled={chainDropdownProps.disabled}
                    >
                        <Search />
                    </StyledButton>
                    <span>
                        <Dropdown {...chainDropdownProps} showExpandIcon />
                        <Dropdown {...ligandsDropdownProps} showExpandIcon />
                    </span>
                </div>
            </div>

            {selection.type === "free" && !_.isEmpty(overlayItems) && overlayItems && (
                <div className="selection">
                    {overlayItems.map(item => (
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
            )}
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
        () => pdbInfo?.chains.map(chain => ({ id: chain.id, text: chain.name })),
        [pdbInfo]
    );

    const selectedChain = getSelectedChain(pdbInfo?.chains, selection.chainId);

    const text = selectedChain
        ? `${i18n.t("Chain")}: ${selectedChain.shortName}`
        : i18n.t("Chains");

    const leftIcon = (
        <i className="icon icon-conceptual icon-structures" style={ebiStyles["icon-lg"]}></i>
    );

    return {
        text,
        items,
        leftIcon,
        selected: selectedChain?.chainId,
        onClick: setChain,
        expanded,
        disabled: Boolean(selection.ligandId),
    };
}

export function getSelectedChain(
    chains: PdbInfo["chains"] | undefined,
    selectedChain: Maybe<string>
) {
    return chains?.find(chain => chain.chainId === selectedChain);
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

    const selectedChain = getSelectedChain(pdbInfo?.chains, selection.chainId);

    const items: DropdownProps["items"] = React.useMemo(() => {
        return pdbInfo?.ligands
            .filter(ligand => ligand.shortChainId === selectedChain?.chainId)
            .map(ligand => ({ id: ligand.shortId, text: ligand.shortId }));
    }, [selectedChain, pdbInfo]);

    const selectedLigand = getSelectedLigand(selection, pdbInfo);

    const text = selectedLigand
        ? `${i18n.t("Ligand")}: ${selectedLigand.shortId}`
        : i18n.t("Ligands");

    const leftIcon = (
        <i className="icon icon-conceptual icon-chemical" style={ebiStyles["icon-lg"]}></i>
    );

    return {
        text,
        items,
        leftIcon,
        onClick: setLigand,
        selected: selectedLigand?.shortId,
        deselectable: true,
        expanded,
        disabled: _.isEmpty(items),
    };
}

const StyledButton = styled.button`
    &:disabled {
        background-color: #59717d;
        cursor: not-allowed;
    }
`;
