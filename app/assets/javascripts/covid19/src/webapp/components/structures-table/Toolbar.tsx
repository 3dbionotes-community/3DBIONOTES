import { GridApi, GridToolbarColumnsButton, GridToolbarContainer } from "@material-ui/data-grid";
import React from "react";
import { DataGrid } from "../../../domain/entities/DataGrid";
import { VirtualScroll, VirtualScrollbarProps } from "../VirtualScrollbar";
import { CustomGridToolbarExport } from "./CustomGridToolbarExport";
import { CustomGridTopPagination } from "./CustomGridTopPagination";
import { SearchBar } from "./SearchBar";
import "./Toolbar.css";
import { CustomCheckboxFilter } from "./CustomCheckboxFilter";
import { SearchExamplesPopover } from "./SearchExamplesPopover";

import { Covid19Filter } from "../../../domain/entities/Covid19Info";

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
                <SearchBar value={search} setValue={setSearch} filterState={filterState} setFilterState={setFilterState} />
                <CustomCheckboxFilter filterState={filterState} setFilterState={setFilterState} />
                <SearchExamplesPopover value={search} setValue={setSearch} />
                <div style={styles.columns}>
                    <CustomGridToolbarExport dataGrid={dataGrid} gridApi={gridApi} />
                    <GridToolbarColumnsButton />
                </div>
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
    container: { padding: 10 },
    columns: { marginLeft: "auto" },
};

function isNonEmptyObject<T>(obj: T | {}): obj is T {
    return Object.keys(obj).length > 0;
}
