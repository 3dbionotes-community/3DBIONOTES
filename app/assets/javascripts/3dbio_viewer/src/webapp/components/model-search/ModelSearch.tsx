import React from "react";
import _ from "lodash";
import classnames from "classnames";
import { Dialog, DialogTitle, DialogContent, IconButton } from "@material-ui/core";

import i18n from "../../utils/i18n";
import { Dropdown, DropdownProps } from "../dropdown/Dropdown";
import { Close, Search } from "@material-ui/icons";
import { useBooleanState } from "../../hooks/use-boolean";
import { useDebounce } from "../../hooks/use-debounce";

import "./ModelSearch.css";

export interface ModelSearchProps {
    title: string;
    onClose(): void;
}

type ModelType = "pdb" | "emdb";

interface IModelItem {
    type: ModelType;
    id: string;
    imageUrl: string;
}

export const ModelSearch: React.FC<ModelSearchProps> = props => {
    const { title, onClose } = props;

    const modelTypes: DropdownProps["items"] = [
        { id: "pdb", text: "PDB" },
        { id: "emdb", text: "EMDB" },
    ];

    const items0: IModelItem[] = [
        {
            type: "pdb",
            id: "7keb",
            imageUrl:
                "https://www.ebi.ac.uk/pdbe/static/entry/7keb_deposited_chain_front_image-200x200.png",
        },
        {
            type: "pdb",
            id: "7kdj",
            imageUrl:
                "https://www.ebi.ac.uk/pdbe/static/entry/7kdj_deposited_chain_front_image-200x200.png",
        },
        {
            type: "emdb",
            id: "EMD-30701",
            imageUrl: "https://www.ebi.ac.uk/pdbe/static/entry/EMD-30701/400_30701.gif",
        },
        {
            type: "emdb",
            id: "EMD-30660",
            imageUrl: "https://www.ebi.ac.uk/pdbe/static/entry/EMD-30660/400_30660.gif",
        },
    ];

    const items = _.concat(items0, items0, items0, items0, items0);

    return (
        <Dialog open={true} onClose={onClose} maxWidth="xl" fullWidth className="model-search">
            <DialogTitle>
                {title}
                <IconButton onClick={onClose}>
                    <Close />
                </IconButton>
            </DialogTitle>

            <DialogContent>
                <div className="params">
                    <div className="search">
                        <input
                            aria-label={i18n.t("Search")}
                            className="form-control"
                            placeholder={i18n.t("Search PDB or EMDB")}
                            type="t2ext"
                        />
                        <Search />
                    </div>

                    <Dropdown
                        text={i18n.t("Model type")}
                        items={modelTypes}
                        onClick={console.debug}
                        showExpandIcon
                    />

                    <button className="upload-model">{i18n.t("Upload model")}</button>
                </div>

                <div className="results">
                    <div className="title">{i18n.t("Search results")}</div>
                    <div className="models">
                        {items.map((item, idx) => (
                            <ModelItem key={idx} item={item} />
                        ))}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

const debounceMs = 150;

const ModelItem: React.FC<{ item: IModelItem }> = props => {
    const { item } = props;
    const [isMouseOver, { enable: setOver, disable: unsetOver }] = useBooleanState(false);
    const setMouseOverD = useDebounce(setOver, debounceMs);
    const unsetMouseOverD = useDebounce(unsetOver, debounceMs);
    const className = classnames("item", isMouseOver ? "hover" : null);

    return (
        <div className={className} onMouseEnter={setMouseOverD} onMouseLeave={unsetMouseOverD}>
            <div className="image">
                <img src={item.imageUrl} />
            </div>

            <div className="name">{item.id}</div>

            <div className="actions">
                {isMouseOver && (
                    <div>
                        <button className="action">{i18n.t("Select")}</button>
                        <button className="action">{i18n.t("Append")}</button>
                    </div>
                )}
            </div>
        </div>
    );
};
