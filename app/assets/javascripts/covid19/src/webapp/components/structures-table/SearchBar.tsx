import React from "react";
import _ from "lodash";
import { TextField, InputAdornment, Tooltip, Chip } from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';
import styled from "styled-components";
import SearchIcon from "@material-ui/icons/Search";
import i18n from "../../../utils/i18n";
import { useEventDebounce } from "../../hooks/useDebounce";
import { Covid19Filter } from "../../../domain/entities/Covid19Info";

export interface SearchBarProps {
    value: string;
    setValue(search: string): void;
    filterState: Covid19Filter;
    setFilterState(filter: Covid19Filter): void;
}

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        listStyle: 'none',
        margin: 0,
      },
    chips: {
      display: 'flex',
      flexWrap: 'wrap',
    },
    chip: {
      margin: 2,
    },
    noLabel: {
      marginTop: theme.spacing(3),
    },
  }));


export const SearchBar: React.FC<SearchBarProps> = React.memo(props => {
    const { value, setValue, filterState, setFilterState } = props;
    const classes = useStyles();
    const [stateValue, setValueFromEv] = useEventDebounce(value, setValue, { delay: 500 });

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
            {Object.keys(_.omitBy(filterState, value => value === false)).map((data) => 
                  <li key={data}>
                    <Chip
                      label={data}
                      onDelete={handleDelete(data)}
                      className={classes.chip}
                    />
                  </li>
              )}
              </div>
                <StyledTextField
                    type="search"
                    variant="outlined"
                    value={stateValue}
                    classes={classesStyles}
                    onChange={setValueFromEv}
                    placeholder={i18n.t("Search protein/organism/PDB ID/EMDB ID/UniProt ID")}
                    InputProps={inputProps}
                />
                </div>
                <Tooltip
                    title={
                        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas cursus pellentesque risus, nec accumsan turpis sagittis non. Duis hendrerit nec odio eu hendrerit. Morbi pellentesque ligula a dui malesuada, nec eleifend massa lacinia. Aliquam non efficitur tellus. Curabitur varius neque at mauris vulputate, eu mattis massa porta. Donec aliquet luctus augue, nec pulvinar enim pharetra a. Ut varius nibh mauris, quis finibus justo lobortis sed. In ultricies dolor et orci hendrerit, et commodo diam accumsan."
                    }
                >
                    <span style={styles.tooltip}>?</span>
                </Tooltip>
        </React.Fragment>
    );
});

const classesStyles = { root: "MuiTextField-root" };

const inputProps = {
    endAdornment: (
        <InputAdornment position="end">
            <SearchIcon />
        </InputAdornment>
    ),
};
/*
&.MuiTextField-root {
        .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline {
            border: 4px solid #607d8b;
            border-radius: 12px;
        }
        .MuiOutlinedInput-root.Mui-focused fieldset {
            border-color: #82a4b5;
        }
    }
*/
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
