import * as React from "react";
import { Covid19Filter } from "../../../domain/entities/Covid19Info";
import { MenuItem, MenuList, Divider, Checkbox } from "@material-ui/core";
import { GridMenu } from "@material-ui/data-grid";
import i18n from "../../../utils/i18n";
import { StyledSearchExampleButton } from "./SearchExampleButton";
import FilterListIcon from "@material-ui/icons/FilterList";
import styled from "styled-components";

export interface CustomCheckboxFilterProps {
    filterState: Covid19Filter;
    setFilterState(filter: Covid19Filter): void;
}

export const CustomCheckboxFilter: React.FC<CustomCheckboxFilterProps> = React.memo(props => {
    const { filterState, setFilterState } = props;
    const [anchorEl, setAnchorEl] = React.useState(null);
    const isOpen = Boolean(anchorEl);

    const openMenu = React.useCallback(event => setAnchorEl(event.currentTarget), []);
    const closeMenu = React.useCallback(() => setAnchorEl(null), []);
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFilterState({
            ...filterState,
            [event.target.name]: event.target.checked,
        });
    };
    const startIcon = React.useMemo(() => <FilterListIcon />, []);

    return (
        <React.Fragment>
            <StyledSearchExampleButton
                color="primary"
                size="small"
                onClick={openMenu}
                aria-expanded={Boolean(anchorEl)}
                aria-label="toolbarExportLabel"
                aria-haspopup="menu"
                endIcon={startIcon}
                style={{ margin: "auto 5px" }}
            >
                {i18n.t("Filter")}
            </StyledSearchExampleButton>

            <GridMenu
                open={isOpen}
                target={anchorEl}
                onClickAway={closeMenu}
                position="bottom-start"
            >
                <MenuList className="MuiDataGrid-gridMenuList" autoFocusItem={isOpen}>
                    <MenuItem>
                        <StyledCheckbox
                            checked={filterState?.antibodies || false}
                            onChange={handleChange}
                            name="antibodies"
                        />
                        {i18n.t("Antibodies")}
                    </MenuItem>
                    <MenuItem>
                        <StyledCheckbox
                            checked={filterState?.nanobodies || false}
                            onChange={handleChange}
                            name="nanobodies"
                        />
                        {i18n.t("Nanobodies")}
                    </MenuItem>
                    <MenuItem>
                        <StyledCheckbox
                            checked={filterState?.sybodies || false}
                            onChange={handleChange}
                            name="sybodies"
                        />
                        {i18n.t("Sybodies")}
                    </MenuItem>
                    <Divider />
                    <MenuItem>
                        <StyledCheckbox
                            checked={filterState?.pdbRedo || false}
                            onChange={handleChange}
                            name="pdbRedo"
                        />
                        {i18n.t("PDB-REDO")}
                    </MenuItem>
                </MenuList>
            </GridMenu>
        </React.Fragment>
    );
});

const StyledCheckbox = styled(Checkbox)`
    &.MuiCheckbox-colorSecondary.Mui-checked {
        color: grey;
    }
`;
