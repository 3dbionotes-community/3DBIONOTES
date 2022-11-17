import _ from "lodash";
import React from "react";
import styled from "styled-components";
import { MenuItem, MenuList, Divider, Checkbox, Button } from "@material-ui/core";
import { GridMenu } from "@material-ui/data-grid";
import FilterListIcon from "@material-ui/icons/FilterList";
import {
    Covid19Filter,
    FilterKey,
    getTranslations,
    getValidationSource,
    Maybe,
    ValidationSource,
} from "../../../domain/entities/Covid19Info";
import i18n from "../../../utils/i18n";
import { HtmlTooltip } from "./HtmlTooltip";

export interface CustomCheckboxFilterProps {
    filterState: Covid19Filter;
    setFilterState(filter: Covid19Filter): void;
    validationSources: ValidationSource[];
}

export const CustomCheckboxFilter: React.FC<CustomCheckboxFilterProps> = React.memo(props => {
    const { filterState, setFilterState, validationSources } = props;
    const [anchorEl, setAnchorEl] = React.useState(null);
    const isOpen = Boolean(anchorEl);
    const openMenu = React.useCallback(event => setAnchorEl(event.currentTarget), []);
    const closeMenu = React.useCallback(() => setAnchorEl(null), []);
    const startIcon = React.useMemo(() => <FilterListIcon />, []);

    const getTooltip = React.useCallback(
        (source: Maybe<ValidationSource>) =>
            source ? (
                <div>
                    {source.methods.map(method => (
                        <>
                            {source.methods.length > 1 ? (
                                <strong>
                                    {i18n.t(`{{methodName}} Method: `, {
                                        nsSeparator: false,
                                        methodName: method.name,
                                    })}
                                </strong>
                            ) : (
                                <strong>{i18n.t("Method: ", { nsSeparator: false })}</strong>
                            )}
                            <span>{method.description}</span>
                            <br />
                            <br />
                        </>
                    ))}
                    {source.description && (
                        <>
                            <strong>{i18n.t("Source: ", { nsSeparator: false })}</strong>
                            <span>{source.description}</span>
                        </>
                    )}
                </div>
            ) : undefined,
        []
    );

    const pdbTooltip = React.useMemo(
        () => getTooltip(getValidationSource(validationSources, "PDB-REDO")),
        [validationSources, getTooltip]
    );
    const cstfTooltip = React.useMemo(
        () => getTooltip(getValidationSource(validationSources, "CSTF")),
        [validationSources, getTooltip]
    );
    const ceresTooltip = React.useMemo(
        () => getTooltip(getValidationSource(validationSources, "CERES")),
        [validationSources, getTooltip]
    );

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
                        tooltip={pdbTooltip}
                    />
                    <FilterItem
                        filterKey="cstf"
                        filterState={filterState}
                        setFilterState={setFilterState}
                        tooltip={cstfTooltip}
                    />
                    <FilterItem
                        filterKey="ceres"
                        filterState={filterState}
                        setFilterState={setFilterState}
                        tooltip={ceresTooltip}
                    />
                    <Divider />
                    <FilterItem
                        filterKey="idr"
                        filterState={filterState}
                        setFilterState={setFilterState}
                    />
                </MenuList>
            </GridMenu>
        </React.Fragment>
    );
});

const FilterItem: React.FC<FilterItemProps> = React.memo(props => {
    const { filterKey, filterState, setFilterState, tooltip } = props;
    const [open, setOpen] = React.useState(false);

    const handleChange = React.useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            setFilterState({
                ...filterState,
                [event.target.name]: event.target.checked,
            });
        },
        [filterState, setFilterState]
    );

    const handleClick = React.useCallback(
        (event: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
            const filter = event.currentTarget.dataset.filter;
            if (filter === undefined) return;
            setFilterState({
                ...filterState,
                [filter]: !filterState[filter as FilterKey],
            });
        },
        [filterState, setFilterState]
    );

    const closeTooltip = React.useCallback(() => {
        setOpen(false);
    }, []);

    const openTooltip = React.useCallback(() => {
        setOpen(true);
    }, []);

    const t = React.useMemo(getTranslations, []);
    const component = React.useMemo(
        () => (
            <MenuItem
                onMouseEnter={openTooltip}
                onMouseLeave={closeTooltip}
                onClick={handleClick}
                data-filter={filterKey}
            >
                <StyledCheckbox
                    checked={filterState[filterKey]}
                    onChange={handleChange}
                    name={filterKey}
                />
                {t.filterKeys[filterKey]}
            </MenuItem>
        ),
        [filterKey, filterState, handleChange, handleClick, t, closeTooltip, openTooltip]
    );

    return tooltip ? (
        <HtmlTooltip title={tooltip} open={open}>
            {component}
        </HtmlTooltip>
    ) : (
        <>{component}</>
    );
});

interface FilterItemProps {
    filterKey: FilterKey;
    filterState: Covid19Filter;
    setFilterState(filter: Covid19Filter): void;
    tooltip?: NonNullable<React.ReactNode>;
}

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
