import { GridToolbarColumnsButton, GridToolbarContainer } from "@material-ui/data-grid";
import React from "react";
import { SearchBar } from "./SearchBar";

export interface ToolbarProps {
    search: string;
    setSearch(search: string): void;
}

export const Toolbar: React.FC<ToolbarProps> = React.memo(props => {
    const { search, setSearch } = props;

    return (
        <GridToolbarContainer style={styles.container}>
            <SearchBar value={search} setValue={setSearch} />
            {/* <CustomGridToolbarExport /> */}
            <GridToolbarColumnsButton style={styles.columns} />
        </GridToolbarContainer>
    );
});

export const styles = {
    container: { padding: 10 },
    search: { width: "30em" },
    columns: { marginLeft: "auto" },
};
