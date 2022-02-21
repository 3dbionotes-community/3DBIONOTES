import React from "react";
import _ from "lodash";
import { makeStyles } from "@material-ui/core";
import { DataGrid, DataGridProps } from "@material-ui/data-grid";
import { Covid19Filter, Id } from "../../../domain/entities/Covid19Info";
import { getColumns } from "./Columns";
import { Toolbar, ToolbarProps } from "./Toolbar";
import { useVirtualScrollbarForDataGrid } from "../VirtualScrollbar";
import { DataGrid as DataGridE } from "../../../domain/entities/DataGrid";
import { useAppContext } from "../../contexts/app-context";

export interface StructuresTableProps {}

export const StructuresTable: React.FC<StructuresTableProps> = React.memo(() => {
    const { compositionRoot } = useAppContext();
    const [page, setPage] = React.useState(0);
    console.log(page);
    const [pageSize, setPageSize] = React.useState(pageSizes[0]);
    const classes = useStyles();

    const [search, setSearch0] = React.useState("");
    const [filterState, setFilterState0] = React.useState(initialFilterState);
    const setFilterState = React.useCallback((value: Covid19Filter) => {
        setPage(0);
        setFilterState0(value);
    }, []);

    const setSearch = React.useCallback((value: string) => {
        setPage(0);
        setSearch0(value);
    }, []);
    
    const {
        gridApi,
        virtualScrollbarProps,
        updateScrollBarFromStateChange,
    } = useVirtualScrollbarForDataGrid();

    const [renderedRowIds, setRenderedRowsFromState] = useRenderedRows();

    const onStateChange = React.useCallback<NonNullable<DataGridProps["onStateChange"]>>(
        params => {
            setRenderedRowsFromState(params);
            updateScrollBarFromStateChange(params);
        },
        [setRenderedRowsFromState, updateScrollBarFromStateChange]
    );

    const [data, setData] = React.useState(() => compositionRoot.getCovid19Info.execute());
    window.app = { data };

    React.useEffect(() => {
        compositionRoot.addDynamicInfo.execute(data, { ids: renderedRowIds }).then(setData);
    }, [compositionRoot, data, renderedRowIds]);

    const filteredData = React.useMemo(() => {
        return compositionRoot.searchCovid19Info.execute({ data, search, filter: filterState });
    }, [compositionRoot, data, search, filterState]);

    const { structures } = filteredData;
    const columns = React.useMemo(() => getColumns(data), [data]);
    const components = React.useMemo(() => ({ Toolbar: Toolbar }), []);

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
    const setFirstPageFilter = React.useCallback<GridProp<"onFilterModelChange">>(() => setPage(0), []);


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
                onStateChange={onStateChange}
                onSortModelChange={setFirstPage}
                onFilterModelChange={setFirstPageFilter}
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

const initialFilterState: Covid19Filter = {
    antibodies: false,
    nanobodies: false,
    sybodies: false,
    pdbRedo: false,
};

function useRenderedRows() {
    const [renderedRowIds, setRenderedRowIds] = React.useState<Id[]>([]);

    const setRenderedRowsFromState = React.useCallback<NonNullable<DataGridProps["onStateChange"]>>(
        gridParams => {
            const { api } = gridParams;
            const { page, pageSize } = gridParams.state.pagination;
            const sortedIds = api.getSortedRowIds() as Id[];
            const visibleIds = Array.from(api.getVisibleRowModels().keys()) as string[];

            const ids = _(sortedIds)
                .intersection(visibleIds)
                .drop(page * pageSize)
                .take(pageSize)
                .value();

            setRenderedRowIds(prevIds => (_.isEqual(prevIds, ids) ? prevIds : ids));
        },
        []
    );

    return [renderedRowIds, setRenderedRowsFromState] as const;
}
