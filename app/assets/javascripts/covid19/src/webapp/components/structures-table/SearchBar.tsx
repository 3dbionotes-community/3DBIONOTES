import { TextField, TextFieldProps } from "@material-ui/core";
import React from "react";
import i18n from "../../../utils/i18n";
import { styles } from "./Toolbar";

export interface SearchBarProps {
    value: string;
    setValue(search: string): void;
}

export const SearchBar: React.FC<SearchBarProps> = React.memo(props => {
    const { value, setValue } = props;

    const setValueFromEv = React.useCallback<NonNullable<TextFieldProps["onChange"]>>(
        ev => {
            setValue(ev.target.value);
        },
        [setValue]
    );

    return (
        <TextField
            type="search"
            value={value || ""}
            style={styles.search}
            onChange={setValueFromEv}
            placeholder={i18n.t("Search by title/PDB/EMDB/Entities/Ligands/Organisms/Details")}
        />
    );
});
