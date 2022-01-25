import React from "react";
import _ from "lodash";
import { TextField, InputAdornment, Tooltip } from "@material-ui/core";
import styled from "styled-components";
import SearchIcon from "@material-ui/icons/Search";

import i18n from "../../../utils/i18n";
import { SearchExampleButton } from "./SearchExampleButton";
import { useEventDebounce } from "../../hooks/useDebounce";

export interface SearchBarProps {
    value: string;
    setValue(search: string): void;
}

export const SearchBar: React.FC<SearchBarProps> = React.memo(props => {
    const { value, setValue } = props;

    const [stateValue, setValueFromEv] = useEventDebounce(value, setValue, { delay: 500 });

    return (
        <div style={styles.wrapper}>
            <div style={styles.searchBar}>
                <StyledTextField
                    type="search"
                    variant="outlined"
                    value={stateValue}
                    classes={classes}
                    onChange={setValueFromEv}
                    placeholder={i18n.t("Search protein/ organism/ PDB ID/ EMDB ID/ UniProt ID)")}
                    InputProps={inputProps}
                />
                <Tooltip
                    title={
                        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas cursus pellentesque risus, nec accumsan turpis sagittis non. Duis hendrerit nec odio eu hendrerit. Morbi pellentesque ligula a dui malesuada, nec eleifend massa lacinia. Aliquam non efficitur tellus. Curabitur varius neque at mauris vulputate, eu mattis massa porta. Donec aliquet luctus augue, nec pulvinar enim pharetra a. Ut varius nibh mauris, quis finibus justo lobortis sed. In ultricies dolor et orci hendrerit, et commodo diam accumsan."
                    }
                >
                    <span style={styles.tooltip}>?</span>
                </Tooltip>
            </div>
            <div style={styles.exampleRow}>
                <p>{i18n.t("Examples")}:</p>
                <SearchExampleButton setValue={setValue} exampleValue="6YOR" />
                <SearchExampleButton setValue={setValue} exampleValue="Homo sapiens" />
                <SearchExampleButton setValue={setValue} exampleValue="SARS-CoV-2" />
            </div>
        </div>
    );
});

const classes = { root: "MuiTextField-root" };

const inputProps = {
    endAdornment: (
        <InputAdornment position="end">
            <SearchIcon />
        </InputAdornment>
    ),
};

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
    flex: 2 1 auto;
`;

const styles = {
    wrapper: { display: "flex" as const, flexDirection: "column" as const },
    exampleRow: { display: "flex" as const, marginTop: 5 },
    searchBar: { display: "flex" as const },
    tooltip: {
        fontWeight: 700,
        padding: "7px 10px",
        marginLeft: 10,
        color: "#ffffff",
        backgroundColor: "rgb(96, 125, 139)",
        borderRadius: 8,
        border: "solid 0px rgb(96, 125, 139)",
        outline: "none",
        cursor: "pointer",
    },
};
