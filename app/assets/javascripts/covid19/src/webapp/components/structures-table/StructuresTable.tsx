import { makeStyles } from "@material-ui/core";
import {
    DataGrid,
    DataGridProps,
    GridToolbarColumnsButton,
    GridToolbarContainer,
    GridToolbarFilterButton,
} from "@material-ui/data-grid";
import React from "react";
import { Covid19Info } from "../../../domain/entities/Covid19Info";
import { getColumns } from "./Columns";

export interface StructuresTableProps {
    data: Covid19Info;
}

export const StructuresTable: React.FC<StructuresTableProps> = React.memo(props => {
    const { data } = props;
    const [page, setPage] = React.useState(0);
    const [pageSize, setPageSize] = React.useState(pageSizes[0]);
    const rows = data.structures;
    const columns = React.useMemo(() => getColumns(data), [data]);
    const classes = useStyles();
    const components = React.useMemo(() => ({ Toolbar: CustomToolbar }), []);

    const setPageFromParams = React.useCallback<NonNullable<DataGridProps["onPageChange"]>>(
        params => setPage(params.page),
        []
    );

    const setFirstPage = React.useCallback<NonNullable<DataGridProps["onSortModelChange"]>>(
        () => setPage(0),
        []
    );

    const setPageSizeFromParams = React.useCallback<NonNullable<DataGridProps["onPageSizeChange"]>>(
        params => setPageSize(params.pageSize),
        []
    );

    return (
        <div className={classes.wrapper}>
            <DataGrid
                page={page}
                // onColumnVisibilityChange={updateVisibilityColumns}
                onSortModelChange={setFirstPage}
                className={classes.root}
                rowHeight={200}
                sortingOrder={sortingOrder}
                rows={rows}
                autoHeight
                columns={columns}
                components={components}
                disableColumnMenu={true}
                rowsPerPageOptions={pageSizes}
                pagination={true}
                pageSize={pageSize}
                onPageChange={setPageFromParams}
                onPageSizeChange={setPageSizeFromParams}
            />
        </div>
    );
});

const CustomToolbar: React.FC = React.memo(() => (
    <GridToolbarContainer>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        {/*<CustomGridToolbarExport /> */}
    </GridToolbarContainer>
));

const useStyles = makeStyles({
    root: {
        "&.MuiDataGrid-root .MuiDataGrid-cell": {
            whiteSpace: "normal",
            display: "flex", // "flex": center vertically. "block" otherwise
        },
        "&.MuiDataGrid-root .MuiDataGrid-cellWithRenderer": {},
    },
    wrapper: { display: "flex", flexGrow: 1 },
});

const pageSizes = [25, 50, 75, 100];
const sortingOrder = ["asc" as const, "desc" as const];
