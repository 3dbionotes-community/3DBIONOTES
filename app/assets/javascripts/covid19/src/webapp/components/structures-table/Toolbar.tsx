import { makeStyles } from "@material-ui/core";
import { GridToolbarColumnsButton, GridToolbarContainer } from "@material-ui/data-grid";
import React from "react";
import { SearchBar } from "./SearchBar";
import "./Toolbar.css";

export interface ToolbarProps {
    search: string;
    setSearch(search: string): void;
}

export const Toolbar: React.FC<ToolbarProps> = React.memo(props => {
    const { search, setSearch } = props;

    return (
        <React.Fragment>
            <GridToolbarContainer style={styles.container}>
                <SearchBar value={search} setValue={setSearch} />
                {/*<CustomGridToolbarExport columns={1} />*/}
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
