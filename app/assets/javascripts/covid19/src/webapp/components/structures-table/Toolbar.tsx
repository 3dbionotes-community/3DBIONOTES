import { GridApi, GridToolbarColumnsButton, GridToolbarContainer } from "@material-ui/data-grid";
import React from "react";
import { DataGrid } from "../../../domain/entities/DataGrid";
import { VirtualScroll, VirtualScrollbarProps } from "../VirtualScrollbar";
import { CustomGridToolbarExport } from "./CustomGridToolbarExport";
import { SearchBar } from "./SearchBar";
import "./Toolbar.css";

export interface ToolbarProps {
    search: string;
    setSearch(search: string): void;
    gridApi: GridApi;
    dataGrid: DataGrid;
    virtualScrollbarProps: VirtualScrollbarProps;
}

export const Toolbar: React.FC<ToolbarProps> = props => {
    const { search, setSearch, gridApi, dataGrid, virtualScrollbarProps } = props;

    return (
        <React.Fragment>
            <GridToolbarContainer style={styles.container}>
                <SearchBar value={search} setValue={setSearch} />
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
