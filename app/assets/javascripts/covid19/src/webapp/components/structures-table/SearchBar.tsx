import React from "react";
import _ from "lodash";
import { TextField, InputAdornment, Chip, CircularProgress } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import styled from "styled-components";
import SearchIcon from "@material-ui/icons/Search";
import i18n from "../../../utils/i18n";
import { useEventDebounce } from "../../hooks/useDebounce";
import { Covid19Filter } from "../../../domain/entities/Covid19Info";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { useAppContext } from "../../contexts/app-context";

export interface SearchBarProps {
    value: string;
    setValue(search: string): void;
    filterState: Covid19Filter;
    setFilterState(filter: Covid19Filter): void;
}

const useStyles = makeStyles(theme => ({
    root: {
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
        listStyle: "none",
        margin: 0,
    },
    chips: {
        display: "flex",
        flexWrap: "wrap",
    },
    chip: {
        margin: 2,
    },
    noLabel: {
        marginTop: theme.spacing(3),
    },
}));

export const SearchBar: React.FC<SearchBarProps> = React.memo(props => {
    const { compositionRoot } = useAppContext();
    const { value, setValue, filterState, setFilterState } = props;
    const [open, setOpen] = React.useState(false);
    const classes = useStyles();
    const [stateValue, setValueFromEv] = useEventDebounce(value, setValue, { delay: 500 });
    const [autoCompleteOptions, setAutoCompleteOptions] = React.useState<Array<string>>(["6YOR", "Homo sapiens", "SARS-CoV-2"]);
    const loading = open && autoCompleteOptions.length === 0;
    console.log(stateValue)
    console.log(autoCompleteOptions)

    React.useEffect(() => {
        const autoComplete = compositionRoot.autoSuggestion.execute(stateValue);
        setAutoCompleteOptions(autoComplete);
    }, [stateValue]);


    React.useEffect(() => {
        if (!open) {
          setAutoCompleteOptions(["6YOR", "Homo sapiens", "SARS-CoV-2"]);
        }
      }, [open]);

    const handleDelete = (chipToDelete: any) => () => {
        setFilterState({
            ...filterState,
            [chipToDelete]: false,
        });
    };

    return (
        <React.Fragment>
                <div style={styles.searchBar}>
                    <div className={classes.root}>
                        {Object.keys(_.omitBy(filterState, value => value === false)).map(data => (
                            <li key={data}>
                                <Chip
                                    label={data}
                                    onDelete={handleDelete(data)}
                                    className={classes.chip}
                                />
                            </li>
                        ))}
                    </div>
                    <StyledAutocomplete
                        id="covid19-searchbar-autocomplete"
                        options={autoCompleteOptions}
                        loading={loading}
                        open={open}
                        onOpen={() => setOpen(true)}
                        onClose={() => setOpen(false)}
                        value={stateValue}
                        onChange={(event, newValue) => newValue !== null && setValue(newValue as string)}
                        inputValue={stateValue}
                        onInputChange={(event, newInputValue) => setValue(newInputValue)}
                        renderInput={(params) => <StyledTextField
                            {...params}
                            type="search"
                            variant="outlined"
                            value={stateValue}
                            classes={classesStyles}
                            onChange={setValueFromEv}
                            placeholder={i18n.t("Search protein/organism/PDB ID/EMDB ID/UniProt ID")}
                            InputProps={{ ...params.InputProps, endAdornment: (
                                <React.Fragment>
                                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                <InputAdornment position="end">
                                    <SearchIcon />
                                </InputAdornment>
                                </React.Fragment>
                            ), type: 'search' }}
                        />}
                        /> 
            </div>
            
            
        </React.Fragment>
    );
});

const classesStyles = { root: "MuiTextField-root" };

const StyledAutocomplete = styled(Autocomplete)`
    &.MuiAutocomplete-hasPopupIcon.MuiAutocomplete-hasClearIcon .MuiAutocomplete-inputRoot[class*="MuiOutlinedInput-root"] {
        padding-right: 10px;
    }
`;

const StyledTextField = styled(TextField)`
    &.MuiTextField-root {
        min-width: 500px;
        .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline {
            border: none;
        }
    }
`;

const styles = {
    wrapper: { display: "flex" as const, flexDirection: "column" as const },
    searchBar: { display: "flex" as const, border: "4px solid #607d8b", borderRadius: 12 },
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
    exampleRow: { display: "flex" as const, alignItems: "center" },
    examplesText: { margin: 0 },
};
