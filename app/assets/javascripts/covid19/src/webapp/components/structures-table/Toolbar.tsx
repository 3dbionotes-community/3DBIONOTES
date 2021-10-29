import { GridApi, GridToolbarColumnsButton, GridToolbarContainer } from "@material-ui/data-grid";
import React from "react";
import { DataGrid } from "../../../domain/entities/DataGrid";
import { VirtualScroll, VirtualScrollbarProps } from "../VirtualScrollbar";
import { CustomGridToolbarExport } from "./CustomGridToolbarExport";
import { SearchBar } from "./SearchBar";
import "./Toolbar.css";
import { CustomCheckboxFilter, FilterModelBodies } from "./CustomCheckboxFilter";

export interface ToolbarProps {
    search: string;
    setSearch(search: string): void;
    /*filterState: FilterModelBodies;
    setFilterState(filter: FilterModelBodies): void;*/
    gridApi: GridApi;
    dataGrid: DataGrid;
    virtualScrollbarProps: VirtualScrollbarProps;
}

export const Toolbar: React.FC<ToolbarProps> = props => {
    //filterState, setFilterState,
    const { search, setSearch, gridApi, dataGrid, virtualScrollbarProps } = props;
    //filterState={filterState} setFilterState={setFilterState}
    return (
        <React.Fragment>
            <GridToolbarContainer style={styles.container}>
                <SearchBar value={search} setValue={setSearch} />
                <CustomCheckboxFilter/>
                <CustomGridToolbarExport dataGrid={dataGrid} gridApi={gridApi} />
                <GridToolbarColumnsButton style={styles.columns} />
            </GridToolbarContainer>

            <VirtualScroll {...virtualScrollbarProps} />
        </React.Fragment>
    );
};

export const styles = {
    container: { padding: 10 },
    search: { width: "30em" },
    columns: { marginLeft: "auto" },
};
