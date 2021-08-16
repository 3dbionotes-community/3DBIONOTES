import { GridToolbarColumnsButton, GridToolbarContainer } from "@material-ui/data-grid";
import React from "react";
import { DataGrid } from "../../../domain/entities/DataGrid";
import { CustomGridToolbarExport } from "./CustomGridToolbarExport";
import { SearchBar } from "./SearchBar";
import "./Toolbar.css";

export interface ToolbarProps {
    search: string;
    setSearch(search: string): void;
    dataGrid: DataGrid;
}

export const Toolbar: React.FC<ToolbarProps> = React.memo(props => {
    const { search, setSearch, dataGrid } = props;

    return (
        <React.Fragment>
            <GridToolbarContainer style={styles.container}>
                <SearchBar value={search} setValue={setSearch} />
                <CustomGridToolbarExport dataGrid={dataGrid} />
                <GridToolbarColumnsButton style={styles.columns} />
            </GridToolbarContainer>

            <div>TOP SCROLLBAR PLACEHOLDER</div>
        </React.Fragment>
    );
});

export const styles = {
    container: { padding: 10 },
    search: { width: "30em" },
    columns: { marginLeft: "auto" },
};
