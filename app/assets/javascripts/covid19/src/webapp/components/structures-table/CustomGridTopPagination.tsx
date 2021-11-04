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

    const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number
    ) => {
        setPage(newPage);
    };
    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setPageSize(parseInt(event.target.value, 10));
        setPage(0);
    };
    return (
        <React.Fragment>
            <TablePagination
                style={{ float: "right", borderBottom: "none", padding: 0 }}
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
