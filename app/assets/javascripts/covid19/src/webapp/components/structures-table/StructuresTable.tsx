import React from "react";
import _ from "lodash";
import { makeStyles } from "@material-ui/core";
import { DataGrid, DataGridProps } from "@material-ui/data-grid";
import { EntityBodiesFilter } from "../../../domain/entities/Covid19Info";
import { getColumns } from "./Columns";
import { Toolbar, ToolbarProps } from "./Toolbar";
import { useVirtualScrollbarForDataGrid } from "../VirtualScrollbar";
import { DataGrid as DataGridE } from "../../../domain/entities/DataGrid";
import { useAppContext } from "../../contexts/app-context";

export interface StructuresTableProps {}

export const StructuresTable: React.FC<StructuresTableProps> = React.memo(() => {
    const { compositionRoot } = useAppContext();
    const [page, setPage] = React.useState(0);
    const [pageSize, setPageSize] = React.useState(pageSizes[0]);
    const classes = useStyles();

    const [search, setSearch] = React.useState("");
    const [filterState, setFilterState] = React.useState(initialFilterState);

    const data = React.useMemo(() => {
        return compositionRoot.getCovid19Info.execute({ search, filter: filterState });
    }, [compositionRoot, search, filterState]);

    const columns = React.useMemo(() => getColumns(data), [data]);
    const components = React.useMemo(() => ({ Toolbar: Toolbar }), []);
    const { structures } = data;

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
                      pageSizes,
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
                rowHeight={220}
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

type GridProp<Prop extends keyof DataGridProps> = NonNullable<DataGridProps[Prop]>;

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

const pageSizes = [10, 25, 50, 75, 100];

const sortingOrder = ["asc" as const, "desc" as const];

const initialFilterState: EntityBodiesFilter = {
    antibody: false,
    nanobody: false,
    sybody: false,
};
