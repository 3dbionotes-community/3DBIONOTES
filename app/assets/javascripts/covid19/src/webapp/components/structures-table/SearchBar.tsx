import React from "react";
import _ from "lodash";
import { TextField, InputAdornment, Chip } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import parse from "autosuggest-highlight/parse";
import match from "autosuggest-highlight/match";
import styled from "styled-components";
import { Close as CloseIcon, Search as SearchIcon } from "@material-ui/icons";
import i18n from "../../../utils/i18n";
import { useDebouncedSetter } from "../../hooks/useDebounce";
import {
    Covid19Filter,
    FilterKey,
    filterKeys,
    getTranslations,
} from "../../../domain/entities/Covid19Info";
import { useAppContext } from "../../contexts/app-context";
import { searchExamples } from "./Toolbar";

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
    const [open, setOpen] = React.useState(false);
    const [stateValue, setStateValue] = React.useState(value);
    const [textValue, setTextValueDebounced] = useDebouncedSetter(stateValue, setStateValue, {
        delay: 300,
    });
    const [autoSuggestionOptions, setAutoSuggestionOptions] = React.useState(searchExamples);
    const selectedFilterNames = filterKeys.filter(key => filterState[key]);

    React.useEffect(() => {
        if (stateValue === "") setAutoSuggestionOptions(searchExamples);
        else if (stateValue.length < 2) setAutoSuggestionOptions([]);
        else
            compositionRoot.getAutoSuggestions
                .execute(stateValue)
                .run(suggestions => setAutoSuggestionOptions(suggestions), console.error);
    }, [stateValue, compositionRoot.getAutoSuggestions]);

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
                    options={autoSuggestionOptions}
                    open={open}
                    fullWidth={true}
                    onOpen={() => setOpen(true)}
                    onClose={() => setOpen(false)}
                    clearOnBlur={false}
                    getOptionSelected={(option, value) =>
                        option.toUpperCase() === value.toUpperCase()
                    }
                    inputValue={textValue}
                    onInputChange={(_event, newInputValue) => setTextValueDebounced(newInputValue)}
                    renderOption={(option, { inputValue }) => {
                        const matches = match(option, inputValue);
                        const parts = parse(option, matches);
                        return (
                            <div>
                                {parts.map((part, index) => (
                                    <span
                                        key={index}
                                        style={{
                                            fontWeight:
                                                part.highlight || inputValue.length < 2 ? 400 : 700,
                                        }}
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
                            value={textValue}
                            onFocus={removeHighlight}
                            onChange={ev => setTextValueDebounced(ev.target.value)}
                            placeholder={i18n.t(
                                "Search protein/organism/PDB ID/EMDB ID/UniProt ID"
                            )}
                            InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                    <React.Fragment>
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
};
