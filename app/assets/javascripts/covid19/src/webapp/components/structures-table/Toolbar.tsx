import { GridApi, GridToolbarColumnsButton, GridToolbarContainer } from "@material-ui/data-grid";
import React from "react";
import { DataGrid } from "../../../domain/entities/DataGrid";
import { VirtualScroll, VirtualScrollbarProps } from "../VirtualScrollbar";
import { CustomGridToolbarExport } from "./CustomGridToolbarExport";
import { CustomGridTopPagination } from "./CustomGridTopPagination";
import { SearchBar } from "./SearchBar";
import "./Toolbar.css";
import { CustomCheckboxFilter } from "./CustomCheckboxFilter";
import { EntityBodiesFilter } from "../../../domain/entities/Covid19Info";

export interface ToolbarProps {
    search: string;
    setSearch(search: string): void;
    filterState: EntityBodiesFilter;
    setFilterState(filter: EntityBodiesFilter): void;
    gridApi: GridApi;
    dataGrid: DataGrid;
    virtualScrollbarProps: VirtualScrollbarProps;
    page: number;
    pageSize: number | undefined;
    setPage: (param: number) => void;
    setPageSize: (param: number) => void;
}

export const Toolbar: React.FC<ToolbarProps> = props => {
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
        setPage,
        setPageSize,
    } = props;

    return (
        <React.Fragment>
            <GridToolbarContainer style={styles.container}>
                <SearchBar value={search} setValue={setSearch} />
                <CustomCheckboxFilter filterState={filterState} setFilterState={setFilterState} />
                <div style={styles.columns}>
                    <CustomGridToolbarExport dataGrid={dataGrid} gridApi={gridApi} />
                    <GridToolbarColumnsButton />
                </div>
            </GridToolbarContainer>
            <CustomGridTopPagination
                dataGrid={dataGrid}
                page={page}
                pageSize={pageSize}
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
