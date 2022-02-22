import React from "react";
import _ from "lodash";
import { TextField, InputAdornment, Chip, CircularProgress } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import parse from "autosuggest-highlight/parse";
import match from "autosuggest-highlight/match";
import styled from "styled-components";
import SearchIcon from "@material-ui/icons/Search";
import i18n from "../../../utils/i18n";
import { useDebouncedSetter } from "../../hooks/useDebounce";
import {
    Covid19Filter,
    FilterKey,
    filterKeys,
    getTranslations,
} from "../../../domain/entities/Covid19Info";
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
    const [stateValue, setValueDebounced] = useDebouncedSetter(value, setValue, { delay: 500 });
    const [autoSuggestionOptions, setAutoSuggestionOptions] = React.useState<Array<string>>([
        "6YOR",
        "Homo sapiens",
        "SARS-CoV-2",
    ]);
    const [loading, setLoading] = React.useState(false);
    const selectedFilterNames = filterKeys.filter(key => filterState[key]);

    React.useEffect(() => {
        setLoading(true);
        const autoSuggestions = compositionRoot.getAutoSuggestions.execute(stateValue);
        setAutoSuggestionOptions(
            stateValue === "" ? ["6YOR", "Homo sapiens", "SARS-CoV-2"] : autoSuggestions
        );
        setLoading(false);
    }, [stateValue, compositionRoot.getAutoSuggestions]);

    const removeChip = React.useCallback(
        (chipToDelete: FilterKey) => {
            setFilterState({ ...filterState, [chipToDelete]: false });
        },
        [setFilterState, filterState]
    );

    const t = React.useMemo(getTranslations, []);

    return (
        <React.Fragment>
            <div style={styles.searchBar}>
                <div style={styles.chips}>
                    {selectedFilterNames.map(filterKey => (
                        <li key={filterKey}>
                            <Chip
                                label={t.filterKeys[filterKey]}
                                onDelete={() => removeChip(filterKey)}
                                style={styles.chip}
                            />
                        </li>
                    ))}
                </div>
                <StyledAutocomplete<string>
                    id="covid19-searchbar-autocomplete"
                    options={autoSuggestionOptions}
                    loading={loading}
                    open={open}
                    fullWidth={true}
                    onOpen={() => setOpen(true)}
                    onClose={() => setOpen(false)}
                    clearOnBlur={false}
                    getOptionSelected={(option, value) =>
                        option.toUpperCase() === value.toUpperCase()
                    }
                    inputValue={stateValue}
                    onInputChange={(_event, newInputValue) => setValueDebounced(newInputValue)}
                    renderOption={(option, { inputValue }) => {
                        const matches = match(option, inputValue);
                        const parts = parse(option, matches);
                        return (
                            <div>
                                {parts.map((part, index) => (
                                    <span
                                        key={index}
                                        style={{ fontWeight: part.highlight ? 700 : 400 }}
                                    >
                                        {part.text}
                                    </span>
                                ))}
                            </div>
                        );
                    }}
                    renderInput={params => (
                        <StyledTextField
                            {...params}
                            variant="outlined"
                            value={stateValue}
                            onChange={ev => setValueDebounced(ev.target.value)}
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
` as typeof Autocomplete;

const StyledTextField = styled(TextField)`
    &.MuiTextField-root {
        .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline {
            border: none;
        }
    }
`;

const styles = {
    searchBar: {
        display: "flex" as const,
        border: "4px solid #607d8b",
        borderRadius: 12,
        width: 500,
    },
    chip: { margin: 2 },
    chips: {
        display: "flex" as const,
        justifyContent: "center",
        flexWrap: "wrap" as const,
        listStyle: "none",
        margin: 0,
    },
};
