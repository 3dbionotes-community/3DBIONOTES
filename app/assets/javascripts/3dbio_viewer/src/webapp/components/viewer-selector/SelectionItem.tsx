import React from "react";
import { IconButton } from "@material-ui/core";
import { Close, Visibility, VisibilityOff } from "@material-ui/icons";
import { DbItem, Selection } from "../../view-models/Selection";

export interface SelectionItemProps {
    selection: Selection;
    item: DbItem;
    onVisibilityChange(selection: Selection, id: DbItem["id"], visible: boolean): void;
    onRemove?(selection: Selection, id: DbItem["id"]): void;
}

export const SelectionItem: React.FC<SelectionItemProps> = React.memo(props => {
    const { item, onVisibilityChange, onRemove, selection } = props;

    const notifyVisibilityChange = React.useCallback(() => {
        onVisibilityChange(selection, item.id, !item.visible);
    }, [selection, item, onVisibilityChange]);

    const notifyRemove = React.useCallback(() => {
        if (onRemove) onRemove(selection, item.id);
    }, [selection, item.id, onRemove]);

    return (
        <div className={item.visible ? "selected" : "unselected"}>
            <IconButton onClick={notifyVisibilityChange}>
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
});
