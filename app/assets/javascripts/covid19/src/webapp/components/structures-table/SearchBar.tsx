import React from "react";
import _ from "lodash";
import { TextField, InputAdornment, Chip, CircularProgress } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import styled from "styled-components";
import SearchIcon from "@material-ui/icons/Search";
import i18n from "../../../utils/i18n";
import { useEventDebounce } from "../../hooks/useDebounce";
import { Covid19Filter } from "../../../domain/entities/Covid19Info";
import { useAppContext } from "../../contexts/app-context";

export interface SearchBarProps {
    value: string;
    setValue(search: string): void;
    filterState: Covid19Filter;
    setFilterState(filter: Covid19Filter): void;
}

export const SearchBar: React.FC<SearchBarProps> = React.memo(props => {
    const { compositionRoot } = useAppContext();
    const { value, setValue, filterState, setFilterState } = props;
    const [open, setOpen] = React.useState(false);
    const [stateValue, setValueFromEv] = useEventDebounce(value, setValue, { delay: 500 });
    const [autoSuggestionOptions, setAutoSuggestionOptions] = React.useState<Array<string>>([
        "6YOR",
        "Homo sapiens",
        "SARS-CoV-2",
    ]);
    const loading = open && autoSuggestionOptions.length === 0;
    const selectedFilterNames = _.keys(_.omitBy(filterState, value => !value));

    React.useEffect(() => {
        const autoSuggestions = compositionRoot.getAutoSuggestions.execute(stateValue);
        setAutoSuggestionOptions(autoSuggestions);
    }, [stateValue, compositionRoot.getAutoSuggestions]);

    React.useEffect(() => {
        if (!open) {
            setAutoSuggestionOptions(["6YOR", "Homo sapiens", "SARS-CoV-2"]);
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
                <div style={styles.chips}>
                    {selectedFilterNames.map(data => (
                        <li key={data}>
                            <Chip
                                label={data.charAt(0).toUpperCase() + data.substr(1).toLowerCase()}
                                onDelete={handleDelete(data)}
                                style={styles.chip}
                            />
                        </li>
                    ))}
                </div>
                <StyledAutocomplete
                    id="covid19-searchbar-autocomplete"
                    options={autoSuggestionOptions}
                    loading={loading}
                    open={open}
                    onOpen={() => setOpen(true)}
                    onClose={() => setOpen(false)}
                    value={stateValue}
                    onChange={(event, newValue) =>
                        newValue !== null && setValue(newValue as string)
                    }
                    inputValue={stateValue}
                    onInputChange={(event, newInputValue) => setValue(newInputValue)}
                    renderInput={params => (
                        <StyledTextField
                            {...params}
                            variant="outlined"
                            value={stateValue}
                            onChange={setValueFromEv}
                            placeholder={i18n.t(
                                "Search protein/organism/PDB ID/EMDB ID/UniProt ID"
                            )}
                            InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                    <React.Fragment>
                                        {loading ? (
                                            <CircularProgress color="inherit" size={20} />
                                        ) : null}
                                        <InputAdornment position="end">
                                            <SearchIcon />
                                        </InputAdornment>
                                    </React.Fragment>
                                ),
                                type: "search",
                            }}
                        />
                    )}
                />
            </div>
        </React.Fragment>
    );
});

const StyledAutocomplete = styled(Autocomplete)`
    &.MuiAutocomplete-hasPopupIcon.MuiAutocomplete-hasClearIcon
        .MuiAutocomplete-inputRoot[class*="MuiOutlinedInput-root"] {
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
    searchBar: { display: "flex" as const, border: "4px solid #607d8b", borderRadius: 12 },
    chip: { margin: 2 },
    chips: {
        display: "flex" as const,
        justifyContent: "center",
        flexWrap: "wrap" as const,
        listStyle: "none",
        margin: 0,
    },
};
