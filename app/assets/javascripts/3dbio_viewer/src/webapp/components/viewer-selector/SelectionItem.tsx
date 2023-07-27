import React from "react";
import { IconButton } from "@material-ui/core";
import { Close, Visibility, VisibilityOff } from "@material-ui/icons";
import { DbItem, Selection } from "../../view-models/Selection";
import i18n from "../../utils/i18n";

export interface SelectionItemProps {
    label?: string;
    type: "main" | "overlay";
    selection: Selection;
    item: DbItem;
    onVisibilityChange(selection: Selection, id: DbItem["id"], visible: boolean): void;
    onRemove?(selection: Selection, id: DbItem["id"]): void;
}

export const SelectionItem: React.FC<SelectionItemProps> = React.memo(props => {
    const { item, onVisibilityChange, onRemove, selection, label, type } = props;

    const notifyVisibilityChange = React.useCallback(() => {
        onVisibilityChange(selection, item.id, !item.visible);
    }, [selection, item, onVisibilityChange]);

    const notifyRemove = React.useCallback(() => {
        if (onRemove) onRemove(selection, item.id);
    }, [selection, item.id, onRemove]);

    return (
        <div className={[item.visible ? "selected" : "unselected", "db-item-" + type].join(" ")}>
            <IconButton onClick={notifyVisibilityChange} title={i18n.t("Show/Hide")}>
                {item.visible ? <Visibility /> : <VisibilityOff />}
            </IconButton>

            <div className={"label-" + type}>
                {label && <span className="label">{label}</span>}
                <span className="id">{item.id}</span>
            </div>

            {onRemove && (
                <IconButton onClick={notifyRemove}>
                    <Close />
                </IconButton>
            )}
        </div>
    );
});
