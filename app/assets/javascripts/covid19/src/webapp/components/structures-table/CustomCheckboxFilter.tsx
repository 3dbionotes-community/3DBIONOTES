import * as React from "react";
import _ from "lodash";
import { Covid19Filter, FilterKey, getTranslations } from "../../../domain/entities/Covid19Info";
import { MenuItem, MenuList, Divider, Checkbox, Button } from "@material-ui/core";
import { GridMenu } from "@material-ui/data-grid";
import i18n from "../../../utils/i18n";
import FilterListIcon from "@material-ui/icons/FilterList";
import styled from "styled-components";

export interface CustomCheckboxFilterProps {
    filterState: Covid19Filter;
    setFilterState(filter: Covid19Filter): void;
}

interface FilterItemProps {
    filterKey: FilterKey;
    filterState: Covid19Filter;
    setFilterState(filter: Covid19Filter): void;
}

export const CustomCheckboxFilter: React.FC<CustomCheckboxFilterProps> = React.memo(props => {
    const { filterState, setFilterState } = props;
    const [anchorEl, setAnchorEl] = React.useState(null);
    const isOpen = Boolean(anchorEl);
    const openMenu = React.useCallback(event => setAnchorEl(event.currentTarget), []);
    const closeMenu = React.useCallback(() => setAnchorEl(null), []);
    const startIcon = React.useMemo(() => <FilterListIcon />, []);

    return (
        <React.Fragment>
            <FilterButton
                color="primary"
                onClick={openMenu}
                aria-expanded={Boolean(anchorEl)}
                aria-label="toolbarExportLabel"
                aria-haspopup="menu"
                endIcon={startIcon}
            >
                {i18n.t("Filter")}
            </FilterButton>

            <GridMenu
                open={isOpen}
                target={anchorEl}
                onClickAway={closeMenu}
                position="bottom-start"
            >
                <MenuList className="MuiDataGrid-gridMenuList" autoFocusItem={isOpen}>
                    <FilterItem
                        filterKey="antibodies"
                        filterState={filterState}
                        setFilterState={setFilterState}
                    />
                    <FilterItem
                        filterKey="nanobodies"
                        filterState={filterState}
                        setFilterState={setFilterState}
                    />
                    <FilterItem
                        filterKey="sybodies"
                        filterState={filterState}
                        setFilterState={setFilterState}
                    />
                    <Divider />
                    <FilterItem
                        filterKey="pdbRedo"
                        filterState={filterState}
                        setFilterState={setFilterState}
                    />
                    <FilterItem
                        filterKey="isolde"
                        filterState={filterState}
                        setFilterState={setFilterState}
                    />
                </MenuList>
            </GridMenu>
        </React.Fragment>
    );
});

const FilterItem: React.FC<FilterItemProps> = React.memo(props => {
    const { filterKey, filterState, setFilterState } = props;

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

    const t = React.useMemo(getTranslations, []);

    return (
        <MenuItem onClick={handleClick} data-filter={filterKey}>
            <StyledCheckbox
                checked={filterState[filterKey]}
                onChange={handleChange}
                name={filterKey}
            />
            {t.filterKeys[filterKey]}
        </MenuItem>
    );
});

const StyledCheckbox = styled(Checkbox)`
    &.MuiCheckbox-colorSecondary.Mui-checked {
        color: #484848;
    }
    padding: 0 8px 0 0 !important;
`;

const FilterButton = styled(Button)`
    &.MuiButton-root {
        padding: 6px 16px;
        margin: auto 5px auto 10px;
        color: #fff;
        height: 45px;
        font-weight: 500;
        text-align: center;
        border-radius: 0.75rem;
        background-color: #607d8b;
        border-color: #607d8b;
        font-size: 0.875rem;
        line-height: 45px;
        &:focus {
            outline: none;
        }
        &:hover {
            border-color: #82a4b5;
            background-color: #82a4b5;
        }
    }
`;
