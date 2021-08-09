import { makeStyles } from "@material-ui/core";
import {
    DataGrid,
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

export const StructuresTable: React.FC<StructuresTableProps> = props => {
    const { data } = props;
    const [page, setPage] = React.useState(0);
    const [pageSize, setPageSize] = React.useState(pageSizes[0]);
    const rows = data.structures;
    const columns = React.useMemo(() => getColumns(data), [data]);
    const classes = useStyles();
    const components = React.useMemo(() => ({ Toolbar: CustomToolbar }), []);

    return (
        <div style={{ display: "flex" }}>
            <div style={{ flexGrow: 1 }}>
                <DataGrid
                    page={page}
                    //onStateChange={setRenderedRowsFromState}
                    className={classes.root}
                    rowHeight={195}
                    //onSortModelChange={setFirstPage}
                    sortingOrder={sortingOrder}
                    rows={rows}
                    autoHeight
                    columns={columns}
                    components={components}
                    disableColumnMenu={true}
                    pageSize={pageSize}
                    onPageChange={params => {
                        setPage(params.page);
                    }}
                    onPageSizeChange={params => {
                        setPageSize(params.pageSize);
                    }}
                    // onColumnVisibilityChange={updateVisibilityColumns}
                    pagination
                    rowsPerPageOptions={pageSizes}
                />
            </div>
        </div>
    );
};

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
            display: "flex", // "block" for non-vertically-centered text
        },
        "&.MuiDataGrid-root .MuiDataGrid-cellWithRenderer": {},
    },
});

const pageSizes = [25, 50, 75, 100];
const sortingOrder = ["asc" as const, "desc" as const];
