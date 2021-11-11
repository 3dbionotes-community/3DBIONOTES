import { TextField, TextFieldProps } from "@material-ui/core";
import React from "react";
import i18n from "../../../utils/i18n";
import { styles } from "./Toolbar";
import { SearchExampleButton } from "./SearchExampleButton";

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
        <div style={{ display: "flex", flexDirection: "column" }}>
            <TextField
                type="search"
                value={value || ""}
                style={styles.search}
                onChange={setValueFromEv}
                placeholder={i18n.t("Search")}
            />
            <div style={searchBarStyle.exampleRow}>
                <SearchExampleButton setValue={setValue} exampleValue="6YOR" />
                <SearchExampleButton setValue={setValue} exampleValue="Homo sapiens" />
                <SearchExampleButton setValue={setValue} exampleValue="SARS-CoV-2" />
            </div>
        </div>
    );
});

const searchBarStyle = {
    exampleRow: {
        display: "flex",
        marginTop: 5,
    },
};
