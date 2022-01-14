import { TextField, TextFieldProps, InputAdornment } from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import React from "react";
import i18n from "../../../utils/i18n";
import { SearchExampleButton } from "./SearchExampleButton";
import styled from "styled-components";

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
            <StyledTextField
                type="search"
                variant="outlined"
                value={value || ""}
                classes={{ root: "MuiTextField-root" }}
                onChange={setValueFromEv}
                placeholder={i18n.t("Search proteins")}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <SearchIcon />
                        </InputAdornment>
                    ),
                }}
            />

            <div style={searchBarStyle.exampleRow}>
                <p>Examples:</p>
                <SearchExampleButton setValue={setValue} exampleValue="6YOR" />
                <SearchExampleButton setValue={setValue} exampleValue="Homo sapiens" />
                <SearchExampleButton setValue={setValue} exampleValue="SARS-CoV-2" />
            </div>
        </div>
    );
});

const StyledTextField = styled(TextField)`
    &.MuiTextField-root {
        .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline {
            border: 4px solid #607d8b;
            border-radius: 12px;
        }
        .MuiOutlinedInput-root.Mui-focused fieldset {
            border-color: #82a4b5;
        }
    }
`;
const searchBarStyle = {
    exampleRow: {
        display: "flex",
        marginTop: 5,
    },
};
