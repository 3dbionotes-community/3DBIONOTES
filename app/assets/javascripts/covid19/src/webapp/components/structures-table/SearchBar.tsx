import React from "react";
import _ from "lodash";
import { TextField, InputAdornment, Chip } from "@material-ui/core";
import Autocomplete, { AutocompleteRenderOptionState } from "@material-ui/lab/Autocomplete";
import parse from "autosuggest-highlight/parse";
import match from "autosuggest-highlight/match";
import styled from "styled-components";
import { Close as CloseIcon, Search as SearchIcon } from "@material-ui/icons";
import i18n from "../../../utils/i18n";
import {
    Covid19Filter,
    FilterKey,
    filterKeys,
    getTranslations,
} from "../../../domain/entities/Covid19Info";
import { useAppContext } from "../../contexts/app-context";
import { searchExamples } from "./Toolbar";
import { useBooleanState } from "../../hooks/useBoolean";

export interface SearchBarProps {
    value: string;
    setValue(search: string): void;
    highlighted: boolean;
    setHighlight: (value: boolean) => void;
    filterState: Covid19Filter;
    setFilterState(filter: Covid19Filter): void;
}

export const SearchBar: React.FC<SearchBarProps> = React.memo(props => {
    const { compositionRoot } = useAppContext();
    const { value, setValue, highlighted, setHighlight, filterState, setFilterState } = props;
    const [open, { enable: showAutocomplete, disable: hideAutocomplete }] = useBooleanState(false);
    const [searchValue, setSearchValue] = React.useState(value);
    const [autoSuggestionOptions, setAutoSuggestionOptions] = React.useState(searchExamples);
    const selectedFilterNames = filterKeys.filter(key => filterState[key]);

    React.useEffect(() => {
        setSearchValue(value);
    }, [value]);

    React.useEffect(() => {
        if (searchValue.length > 2) {
            compositionRoot.getAutoSuggestions
                .execute(searchValue)
                .run(suggestions => setAutoSuggestionOptions(suggestions), console.error);
        }
    }, [searchValue, compositionRoot.getAutoSuggestions]);

    const removeChip = React.useCallback(
        (chipToDelete: FilterKey) => {
            setFilterState({ ...filterState, [chipToDelete]: false });
        },
        [setFilterState, filterState]
    );

    const t = React.useMemo(getTranslations, []);

    const searchBarStyles = React.useMemo(
        () => ({
            ...styles.searchBar,
            ...{ background: highlighted ? "#ffffdd" : undefined },
        }),
        [highlighted]
    );

    const removeHighlight = React.useCallback(() => setHighlight(false), [setHighlight]);

    const suggestions = React.useMemo(() => {
        if (searchValue === "") {
            return searchExamples;
        } else {
            return _([searchValue.toLowerCase(), ...autoSuggestionOptions])
                .uniq()
                .sortBy(s => s !== searchValue)
                .value();
        }
    }, [autoSuggestionOptions, searchValue]);

    const resetValueIfEmpty = React.useCallback(() => {
        if (searchValue === "") setSearchValue(value);
    }, [searchValue, value]);

    const renderInput = React.useCallback(
        params => (
            <StyledTextField
                {...params}
                variant="outlined"
                value={searchValue}
                onFocus={removeHighlight}
                onChange={ev => setSearchValue(ev.target.value)}
                onBlur={resetValueIfEmpty}
                onKeyPress={e => {
                    if (e.key === "Enter") {
                        setValue(searchValue);
                    }
                }}
                placeholder={i18n.t("Search protein/organism/PDB ID/EMDB ID/UniProt ID")}
                InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                        <React.Fragment>
                            <InputAdornment
                                position="end"
                                style={styles.searchButton}
                                onClick={() => setValue(searchValue)}
                            >
                                <SearchIcon />
                            </InputAdornment>
                        </React.Fragment>
                    ),
                    type: "search",
                }}
            />
        ),
        [removeHighlight, searchValue, setValue, resetValueIfEmpty]
    );

    return (
        <React.Fragment>
            <div style={searchBarStyles}>
                <div style={styles.chips}>
                    {selectedFilterNames.map(filterKey => (
                        <StyledChip
                            key={filterKey}
                            deleteIcon={<CloseIcon />}
                            label={t.filterKeys[filterKey]}
                            onDelete={() => removeChip(filterKey)}
                        />
                    ))}
                </div>
                <StyledAutocomplete<string>
                    id="covid19-searchbar-autocomplete"
                    options={suggestions}
                    open={open && (searchValue.length > 2 || searchValue === "")}
                    fullWidth={true}
                    freeSolo={undefined} // weird...
                    autoComplete={true}
                    selectOnFocus={true}
                    autoSelect={true}
                    clearOnBlur={false}
                    clearOnEscape={true}
                    openOnFocus={true}
                    onOpen={showAutocomplete}
                    onClose={hideAutocomplete}
                    inputValue={searchValue}
                    onChange={(_event, option, reason) =>
                        reason === "select-option" && option && setValue(option)
                    }
                    onInputChange={(event, newInputValue) => {
                        /* Fix bug: if event is null or type blur, somehow, newInputValue randomly picks one of the search examples */
                        if (event !== null && event.type !== "blur") setSearchValue(newInputValue);
                    }}
                    renderOption={renderOption}
                    renderInput={renderInput}
                />
            </div>
        </React.Fragment>
    );
});

function renderOption(option: string, { inputValue }: AutocompleteRenderOptionState) {
    const matches = match(option, inputValue);
    const parts = parse(option, matches);
    return (
        <div>
            {parts.map((part, index) => (
                <span
                    key={index}
                    style={{
                        fontWeight: part.highlight || inputValue.length < 2 ? 400 : 700,
                    }}
                >
                    {part.text}
                </span>
            ))}
        </div>
    );
}

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

const StyledChip = styled(Chip)`
    &.MuiChip-root {
        height: 1.5rem !important;
        background-color: #575757 !important;
        color: #fff;
        margin-left: 6px;
        border-radius: 8px;
    }
    .MuiChip-deleteIcon {
        width: 1rem;
        color: rgba(255, 255, 255, 0.7);
    }
    .MuiChip-deleteIcon:hover {
        color: rgba(255, 255, 255, 1);
    }
`;

const styles = {
    searchBar: {
        display: "flex" as const,
        border: "4px solid #607d8b",
        borderRadius: "0.75rem",
        width: 500,
    },
    chips: {
        display: "flex" as const,
        alignItems: "center",
        listStyle: "none",
        margin: 0,
    },
    searchButton: {
        cursor: "pointer",
    },
};
