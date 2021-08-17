import React from "react";
import _ from "lodash";
import { makeStyles } from "@material-ui/core";
import { DataGrid, DataGridProps } from "@material-ui/data-grid";
import { Covid19Info, searchStructures } from "../../../domain/entities/Covid19Info";
import { Field, getColumns } from "./Columns";
import { Toolbar, ToolbarProps } from "./Toolbar";
import { useVirtualScrollbarForDataGrid } from "../VirtualScrollbar";

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

    const [columnsVisibility, setColumnsVisibility] = React.useState<Record<string, boolean>>({});
    const visibleDefColumns = React.useMemo(() => {
        return columns.definition.filter(column => columnsVisibility[column.field] !== false);
    }, [columnsVisibility, columns.definition]);

    const updateColumnsVisibility = React.useCallback<
        NonNullable<DataGridProps["onColumnVisibilityChange"]>
    >(params => {
        setColumnsVisibility(prevValue => ({ ...prevValue, [params.field]: params.isVisible }));
    }, []);

    const structures = searchStructures(data.structures, search);
    const components = React.useMemo(() => ({ Toolbar: Toolbar }), []);

    const dataGrid = React.useMemo(() => {
        const visibilityMapping = _.fromPairs(
            visibleDefColumns.map(gridColDef => [gridColDef.field, !gridColDef.hide])
        ) as Record<Field, boolean>;
        const visibleColumns = columns.base.filter(c => visibilityMapping[c.field]);
        return { columns: visibleColumns, structures };
    }, [columns, structures, visibleDefColumns]);

    const {
        virtualScrollbarProps,
        updateScrollBarFromStateChange,
    } = useVirtualScrollbarForDataGrid();

    const componentsProps = React.useMemo<{ toolbar: ToolbarProps }>(() => {
        return { toolbar: { search, setSearch, dataGrid, virtualScrollbarProps } };
    }, [search, setSearch, dataGrid, virtualScrollbarProps]);

    const setPageFromParams = React.useCallback<GridProp<"onPageChange">>(params => {
        return setPage(params.page);
    }, []);

    const setFirstPage = React.useCallback<GridProp<"onSortModelChange">>(() => setPage(0), []);

    const setPageSizeFromParams = React.useCallback<GridProp<"onPageSizeChange">>(params => {
        return setPageSize(params.pageSize);
    }, []);

    return (
        <div className={classes.wrapper}>
            <DataGrid
                page={page}
                onColumnVisibilityChange={updateColumnsVisibility}
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
