import { GridApi, GridToolbarColumnsButton, GridToolbarContainer } from "@material-ui/data-grid";
import { Tooltip } from "@material-ui/core";

import React from "react";
import { DataGrid } from "../../../domain/entities/DataGrid";
import { VirtualScroll, VirtualScrollbarProps } from "../VirtualScrollbar";
import { CustomGridToolbarExport } from "./CustomGridToolbarExport";
import { CustomGridTopPagination } from "./CustomGridTopPagination";
import { SearchBar } from "./SearchBar";
import "./Toolbar.css";
import { CustomCheckboxFilter } from "./CustomCheckboxFilter";
import { Covid19Filter } from "../../../domain/entities/Covid19Info";
import { SearchExampleButton } from "./SearchExampleButton";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import i18n from "../../../utils/i18n";
import styled from "styled-components";

export interface ToolbarProps {
    search: string;
    setSearch(search: string): void;
    filterState: Covid19Filter;
    setFilterState(filter: Covid19Filter): void;
    gridApi: GridApi;
    dataGrid: DataGrid;
    virtualScrollbarProps: VirtualScrollbarProps;
    page: number;
    pageSize: number | undefined;
    pageSizes: number[];
    setPage: (param: number) => void;
    setPageSize: (param: number) => void;
}

// Toolbar is called with empty object on initialization

export const Toolbar: React.FC<ToolbarProps | {}> = props => {
    if (!isNonEmptyObject<ToolbarProps>(props)) return null;

    const {
        search,
        setSearch,
        filterState,
        setFilterState,
        gridApi,
        dataGrid,
        virtualScrollbarProps,
        page,
        pageSize,
        pageSizes,
        setPage,
        setPageSize,
    } = props;

    return (
        <React.Fragment>
            <GridToolbarContainer style={styles.container}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex" }}>
                        <SearchBar
                            value={search}
                            setValue={setSearch}
                            filterState={filterState}
                            setFilterState={setFilterState}
                        />
                        <CustomCheckboxFilter
                            filterState={filterState}
                            setFilterState={setFilterState}
                        />
                        <Tooltip
                            title={
                                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas cursus pellentesque risus, nec accumsan turpis sagittis non. Duis hendrerit nec odio eu hendrerit. Morbi pellentesque ligula a dui malesuada, nec eleifend massa lacinia. Aliquam non efficitur tellus. Curabitur varius neque at mauris vulputate, eu mattis massa porta. Donec aliquet luctus augue, nec pulvinar enim pharetra a. Ut varius nibh mauris, quis finibus justo lobortis sed. In ultricies dolor et orci hendrerit, et commodo diam accumsan."
                            }
                        >
                            <span style={styles.tooltip}>
                                <HelpOutlineIcon />
                            </span>
                        </Tooltip>
                    </div>
                    <div style={styles.exampleRow}>
                        <p style={styles.examplesText}>{i18n.t("Examples")}:</p>
                        <SearchExampleButton setValue={setSearch} exampleValue="6YOR" />
                        <SearchExampleButton setValue={setSearch} exampleValue="Homo sapiens" />
                        <SearchExampleButton setValue={setSearch} exampleValue="SARS-CoV-2" />
                    </div>
                </div>

                <GridToolbarActions>
                    <CustomGridToolbarExport dataGrid={dataGrid} gridApi={gridApi} />
                    <GridToolbarColumnsButton />
                </GridToolbarActions>
            </GridToolbarContainer>

            <CustomGridTopPagination
                dataGrid={dataGrid}
                page={page}
                pageSize={pageSize}
                pageSizes={pageSizes}
                setPage={setPage}
                setPageSize={setPageSize}
            />

            <VirtualScroll {...virtualScrollbarProps} />
        </React.Fragment>
    );
};

export const styles = {
    container: { padding: 10, alignItems: "flex-start" },
    containerPagination: {
        display: "flex",
        justifyContent: "right",
        flexDirection: "column" as const,
        marginLeft: "auto",
    },
    tooltip: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        height: "45px",
        width: "45px",
        margin: "auto 5px",
        color: "#ffffff",
        backgroundColor: "rgb(96, 125, 139)",
        borderRadius: "0.75rem",
        border: "solid 0px rgb(96, 125, 139)",
        outline: "none",
        cursor: "pointer",
    },
    exampleRow: { display: "flex" as const, alignItems: "center" },
    examplesText: { margin: 0 },
};

function isNonEmptyObject<T>(obj: T | {}): obj is T {
    return Object.keys(obj).length > 0;
}

const GridToolbarActions = styled.div`
    display: flex;
    align-items: center;
    height: 45px;
    margin-left: auto;
    .MuiButton-textSizeSmall {
        padding: 6px 8px;
        font-size: 1rem;
        color: #607d8b;
        .MuiButton-iconSizeSmall > *:first-child {
            font-size: 1.5rem;
        }
    }
`;
