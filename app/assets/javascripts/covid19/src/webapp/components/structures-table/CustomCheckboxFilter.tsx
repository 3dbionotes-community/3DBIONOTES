import * as React from "react";
import _ from "lodash";
import { Covid19Filter, FilterKey, getTranslations } from "../../../domain/entities/Covid19Info";
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
    const handleClick = (event: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
        const filter = event.currentTarget.dataset.filter;
        if (filter === undefined) return;

        setFilterState({
            ...filterState,
            [filter]: !filterState[filter as FilterKey],
        });
    };
    const startIcon = React.useMemo(() => <FilterListIcon />, []);

    const t = React.useMemo(getTranslations, []);

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
                    <MenuItem onClick={handleClick} data-filter={"antibodies"}>
                        <StyledCheckbox
                            checked={filterState.antibodies}
                            onChange={handleChange}
                            name="antibodies"
                        />
                        {t.filterKeys.antibodies}
                    </MenuItem>
                    <MenuItem onClick={handleClick} data-filter={"nanobodies"}>
                        <StyledCheckbox
                            checked={filterState.nanobodies}
                            onChange={handleChange}
                            name="nanobodies"
                        />
                        {t.filterKeys.nanobodies}
                    </MenuItem>
                    <MenuItem onClick={handleClick} data-filter={"sybodies"}>
                        <StyledCheckbox
                            checked={filterState.sybodies}
                            onChange={handleChange}
                            name="sybodies"
                        />
                        {t.filterKeys.sybodies}
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleClick} data-filter={"pdbRedo"}>
                        <StyledCheckbox
                            checked={filterState.pdbRedo}
                            onChange={handleChange}
                            name="pdbRedo"
                        />
                        {t.filterKeys.pdbRedo}
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
