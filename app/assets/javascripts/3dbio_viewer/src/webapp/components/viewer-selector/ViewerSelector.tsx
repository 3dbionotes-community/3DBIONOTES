import { IconButton } from "@material-ui/core";
import { Close, Search, Visibility, VisibilityOff } from "@material-ui/icons";
import React from "react";
import { useBooleanState } from "../../hooks/use-boolean";
import i18n from "../../utils/i18n";
import { Dropdown, DropdownProps } from "../dropdown/Dropdown";
import { ModelSearch } from "../model-search/ModelSearch";
import "./ViewerSelector.css";

export const ViewerSelector: React.FC = () => {
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
                    <DbItem label={i18n.t("PDB")} id="6XQB" />
                    <DbItem label={i18n.t("EMDB")} id="EMD-13577" />
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
                    <SelectionItem id="5ER3" selected={false} />
                    <SelectionItem id="5ER4" selected={true} />
                    <SelectionItem id="5ER5" selected={true} />
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

const DbItem: React.FC<{ label: string; id: string }> = props => {
    const { label, id } = props;

    return (
        <div className="db-item">
            <div className="label">{label}</div>
            <div className="content">
                <Visibility />
                <span className="id">{id}</span>
            </div>
        </div>
    );
};

const SelectionItem: React.FC<{ id: string; selected?: boolean }> = props => {
    const { id, selected } = props;
    return (
        <div className={selected ? "selected" : "unselected"}>
            <IconButton>{selected ? <Visibility /> : <VisibilityOff />}</IconButton>
            <span className="id">{id}</span>
            <IconButton>
                <Close />
            </IconButton>
        </div>
    );
};
