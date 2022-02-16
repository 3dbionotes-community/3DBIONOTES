import React from "react";
import _ from "lodash";
import { Popover, Typography } from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';
import { SearchExampleButton } from "./SearchExampleButton";
import { StyledSearchExampleButton } from "./SearchExampleButton";

export interface SearchBarProps {
    value: string;
    setValue(search: string): void;
}

const useStyles = makeStyles((theme) => ({
    typography: {
      padding: theme.spacing(2),
    },
  }));
export const SearchExamplesPopover: React.FC<SearchBarProps> = React.memo(props => {
    const classesStyles = useStyles();
    const { value, setValue } = props;
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleClick = (event: any) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

    return (
        <React.Fragment>
            <StyledSearchExampleButton aria-describedby={id} variant="contained" color="primary" onClick={handleClick}>
                Search examples
            </StyledSearchExampleButton>
            <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Typography className={classesStyles.typography}>Try any of this search examples:</Typography>
        <div style={styles.exampleRow}>
                <SearchExampleButton setValue={setValue} exampleValue="6YOR" />
                <SearchExampleButton setValue={setValue} exampleValue="Homo sapiens" />
                <SearchExampleButton setValue={setValue} exampleValue="SARS-CoV-2" />
            </div>
      </Popover>
        </React.Fragment>
    );
});
const styles = {
    exampleRow: { display: "flex" as const, alignItems: "center" },
};
