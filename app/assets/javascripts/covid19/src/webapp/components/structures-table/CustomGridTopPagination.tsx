import React from "react";
import TablePagination from "@material-ui/core/TablePagination";
import { DataGrid } from "../../../domain/entities/DataGrid";

export interface CustomGridTopPaginationProps {
    dataGrid: DataGrid;
    page: number;
    pageSize: number | undefined;
    setPage: (param: number) => void;
    setPageSize: (param: number) => void;
}

export const CustomGridTopPagination: React.FC<CustomGridTopPaginationProps> = React.memo(props => {
    const { dataGrid, page, pageSize, setPage, setPageSize } = props;
    const pageSizes = [25, 50, 75, 100];

    const handleChangePage = React.useCallback(
        (_event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
            setPage(newPage);
        },
        [setPage]
    );

    const handleChangeRowsPerPage = React.useCallback(
        (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setPageSize(parseInt(event.target.value, 10));
            setPage(0);
        },
        [setPageSize, setPage]
    );

    return (
        <React.Fragment>
            <TablePagination
                component="div" /* Default component is td, but we the parent component is not a table */
                style={styles.table}
                count={dataGrid?.structures?.length}
                page={page}
                onChangePage={handleChangePage}
                rowsPerPageOptions={pageSizes}
                rowsPerPage={pageSize || 10}
                onChangeRowsPerPage={handleChangeRowsPerPage}
            />
        </React.Fragment>
    );
});

const styles = {
    table: { float: "right" as const, borderBottom: "none" as const, padding: 0 },
};
