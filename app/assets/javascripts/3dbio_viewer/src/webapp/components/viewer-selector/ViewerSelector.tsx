import { IconButton } from "@material-ui/core";
import { Close, Search, Visibility, VisibilityOff } from "@material-ui/icons";
import React from "react";
import { useBooleanState } from "../../hooks/use-boolean";
import i18n from "../../utils/i18n";
import { SelectionState } from "../../view-models/SelectionState";
import { Dropdown, DropdownProps } from "../dropdown/Dropdown";
import { ModelSearch } from "../model-search/ModelSearch";
import "./ViewerSelector.css";

interface ViewerSelectorProps {
    selection: SelectionState;
}

export const ViewerSelector: React.FC<ViewerSelectorProps> = props => {
    const { selection } = props;

    const chainItems: DropdownProps["items"] = [
        { id: "A", text: "Chain A" },
        { id: "B", text: "Chain B" },
    ];

    const ligandItems: DropdownProps["items"] = [
        { id: "L1", text: "Ligand 1" },
        { id: "L2", text: "Ligand 2" },
    ];

    const [isSearchOpen, { enable: openSearch, disable: closeSearch }] = useBooleanState(false);

    return (
        <div id="viewer-selector">
            <div className="db">
                <div className="status">
                    <DbItem label={i18n.t("PDB")} id={selection.main.pdbId} />
                    <DbItem label={i18n.t("EMDB")} id={selection.main.emdbId} />

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
                        <SelectionItem key={item.id} id={item.id} visible={item.visible} />
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

const DbItem: React.FC<{ label: string; id: string | undefined }> = props => {
    const { label, id } = props;
    if (!id) return null;

    return (
        <div className="db-item">
            <div className="label">{label}</div>
            <div className="content">
                <IconButton>
                    <Visibility />
                </IconButton>
                <span className="id">{id}</span>
            </div>
        </div>
    );
};

const SelectionItem: React.FC<{ id: string; visible?: boolean }> = props => {
    const { id, visible: visible } = props;

    return (
        <div className={visible ? "selected" : "unselected"}>
            <IconButton>{visible ? <Visibility /> : <VisibilityOff />}</IconButton>
            <span className="id">{id}</span>
            <IconButton>
                <Close />
            </IconButton>
        </div>
    );
};
