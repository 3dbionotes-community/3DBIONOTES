import { makeStyles } from "@material-ui/core";
import { DataGrid, DataGridProps } from "@material-ui/data-grid";
import React from "react";
import { Covid19Info, searchStructures } from "../../../domain/entities/Covid19Info";
import { getColumns } from "./Columns";
import { Toolbar, ToolbarProps } from "./Toolbar";

export interface StructuresTableProps {
    data: Covid19Info;
}

type GridProp<Prop extends keyof DataGridProps> = NonNullable<DataGridProps[Prop]>;

export const StructuresTable: React.FC<StructuresTableProps> = React.memo(props => {
    const { data } = props;
    const [page, setPage] = React.useState(0);
    const [pageSize, setPageSize] = React.useState(pageSizes[0]);
    const columns = React.useMemo(() => getColumns(data), [data]);
    const classes = useStyles();
    const [search, setSearch] = React.useState("");

    const components = React.useMemo(() => ({ Toolbar: Toolbar }), []);

    const componentsProps = React.useMemo<{ toolbar: ToolbarProps }>(
        () => ({ toolbar: { search, setSearch } }),
        [search, setSearch]
    );

    const setPageFromParams = React.useCallback<GridProp<"onPageChange">>(params => {
        return setPage(params.page);
    }, []);

    const setFirstPage = React.useCallback<GridProp<"onSortModelChange">>(() => setPage(0), []);

    const setPageSizeFromParams = React.useCallback<GridProp<"onPageSizeChange">>(params => {
        return setPageSize(params.pageSize);
    }, []);

    const structures = searchStructures(data.structures, search);

    return (
        <div className={classes.wrapper}>
            <DataGrid
                page={page}
                // onColumnVisibilityChange={updateVisibilityColumns}
                onSortModelChange={setFirstPage}
                className={classes.root}
                rowHeight={200}
                sortingOrder={sortingOrder}
                rows={structures}
                autoHeight
                columns={columns}
                disableColumnMenu={true}
                rowsPerPageOptions={pageSizes}
                pagination={true}
                pageSize={pageSize}
                onPageChange={setPageFromParams}
                onPageSizeChange={setPageSizeFromParams}
                components={components}
                componentsProps={componentsProps}
            />
        </div>
    );
});

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
