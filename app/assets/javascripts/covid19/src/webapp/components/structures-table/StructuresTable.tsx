import React from "react";
import _ from "lodash";
import { makeStyles } from "@material-ui/core";
import { DataGrid, DataGridProps } from "@material-ui/data-grid";
import { Covid19Info, searchAndFilterStructures } from "../../../domain/entities/Covid19Info";
import { getColumns } from "./Columns";
import { Toolbar, ToolbarProps } from "./Toolbar";
import { useVirtualScrollbarForDataGrid } from "../VirtualScrollbar";
import { DataGrid as DataGridE } from "../../../domain/entities/DataGrid";

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
    const [filterState, setFilterState] = React.useState({
        antibody: false,
        nanobody: false,
        sybody: false,
    });
    const structures = searchAndFilterStructures(data.structures, search, filterState);
    const components = React.useMemo(() => ({ Toolbar: Toolbar }), []);

    const {
        gridApi,
        virtualScrollbarProps,
        updateScrollBarFromStateChange,
    } = useVirtualScrollbarForDataGrid();

    const dataGrid = React.useMemo<DataGridE>(() => {
        return { columns: columns.base, structures };
    }, [columns, structures]);

    const componentsProps = React.useMemo<{ toolbar: ToolbarProps } | undefined>(() => {
        return gridApi
            ? {
                  toolbar: {
                      search,
                      setSearch,
                      filterState,
                      setFilterState,
                      gridApi,
                      dataGrid,
                      virtualScrollbarProps,
                      page,
                      pageSize,
                      setPage,
                      setPageSize,
                  },
              }
            : undefined;
    }, [
        search,
        setSearch,
        filterState,
        setFilterState,
        gridApi,
        dataGrid,
        virtualScrollbarProps,
        page,
        pageSize,
        setPage,
        setPageSize,
    ]);

    const setFirstPage = React.useCallback<GridProp<"onSortModelChange">>(() => setPage(0), []);

    const setPageFromParams = React.useCallback<GridProp<"onPageChange">>(params => {
        return setPage(params.page);
    }, []);

    const setPageSizeFromParams = React.useCallback<GridProp<"onPageSizeChange">>(params => {
        return setPageSize(params.pageSize);
    }, []);

    return (
        <div className={classes.wrapper}>
            <DataGrid
                page={page}
                onStateChange={updateScrollBarFromStateChange}
                onSortModelChange={setFirstPage}
                className={classes.root}
                rowHeight={200}
                sortingOrder={sortingOrder}
                rows={structures}
                autoHeight
                columns={columns.definition}
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
    wrapper: {},
});

const pageSizes = [25, 50, 75, 100];
const sortingOrder = ["asc" as const, "desc" as const];
