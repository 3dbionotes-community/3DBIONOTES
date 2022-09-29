import React from "react";
import _ from "lodash";
import { makeStyles } from "@material-ui/core";
import { DataGrid, DataGridProps, GridSortModel } from "@material-ui/data-grid";
import { Structure, updateStructures } from "../../../domain/entities/Covid19Info";
import { Field, getColumns, IDROptions, ViewMoreOptions } from "./Columns";
import { Covid19Filter, Id } from "../../../domain/entities/Covid19Info";
import { Toolbar, ToolbarProps } from "./Toolbar";
import { useVirtualScrollbarForDataGrid } from "../VirtualScrollbar";
import { DataGrid as DataGridE } from "../../../domain/entities/DataGrid";
import { useAppContext } from "../../contexts/app-context";
import { ViewMoreDialog } from "./ViewMoreDialog";
import { useBooleanState } from "../../hooks/useBoolean";
import { sendAnalytics } from "../../../utils/analytics";
import { IDRDialog } from "./IDRDialog";

export interface StructuresTableProps {
    search: string;
    highlighted: boolean;
    setSearch: (value: string) => void;
    setHighlight: (value: boolean) => void;
}

export const rowHeight = 220;

const noSort: GridSortModel = [];

const defaultSort: GridSortModel = [{ field: "emdb", sort: "desc" }];

export const StructuresTable: React.FC<StructuresTableProps> = React.memo(props => {
    const { search, setSearch: setSearch0, highlighted, setHighlight } = props;
    const { compositionRoot } = useAppContext();
    const [page, setPage] = React.useState(0);
    const [pageSize, setPageSize] = React.useState(pageSizes[0]);
    const classes = useStyles();

    const [isViewMoreOpen, { enable: openViewMore, disable: closeViewMore }] = useBooleanState(
        false
    );
    const [detailsOptions, setDetailsOptions] = React.useState<FieldStructure>();
    const [idrOptions, setIDROptions] = React.useState<IDROptions>();
    const [isIDROpen, { enable: openIDR, disable: closeIDR }] = useBooleanState(false);
    const [sortModel, setSortModel] = React.useState<GridSortModel>(defaultSort);

    const [filterState, setFilterState0] = React.useState(initialFilterState);

    const setFilterState = React.useCallback((value: Covid19Filter) => {
        setPage(0);
        setFilterState0(value);
    }, []);

    const setSearch = React.useCallback(
        (value: string) => {
            setPage(0);
            sendAnalytics({
                type: "event",
                category: "covid_table",
                action: "search",
                label: value,
            });
            setSearch0(value);
            setSortModel(value ? noSort : defaultSort);
        },
        [setSearch0]
    );

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
        compositionRoot.addDynamicInfo.execute(data, { ids: renderedRowIds }).then(structures => {
            setData(data => updateStructures(data, structures));
        });
    }, [compositionRoot, data, renderedRowIds]);

    const filteredData = React.useMemo(() => {
        return compositionRoot.searchCovid19Info.execute({ data, search, filter: filterState });
    }, [compositionRoot, data, search, filterState]);

    const { structures } = filteredData;

    const showDetailsDialog = React.useCallback(
        (options: ViewMoreOptions) => {
            sendAnalytics({
                type: "event",
                action: "open",
                category: "dialog",
                label: `Details. Field: ${options.field}, PDB: ${options.row.pdb?.id}`,
            });
            openViewMore();
            setDetailsOptions({ field: options.field, structure: options.row });
        },
        [openViewMore]
    );

    const showIDRDialog = React.useCallback(
        (options: IDROptions) => {
            sendAnalytics({
                type: "event",
                action: "open",
                category: "dialog",
                label: `Ligand IDR. Ligand: {}`,
            });
            openIDR();
            setIDROptions(options);
        },
        [openIDR]
    );

    const columns = React.useMemo(() => {
        return getColumns(data, {
            onClickDetails: showDetailsDialog,
            onClickIDR: showIDRDialog,
        });
    }, [data, showDetailsDialog, showIDRDialog]);

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
                      highlighted,
                      setHighlight,
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
        highlighted,
        setHighlight,
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

    const resetPageAndSorting = React.useCallback<GridProp<"onSortModelChange">>(_modelParams => {
        setPage(0);
    }, []);

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
                sortModel={sortModel}
                onSortModelChange={resetPageAndSorting}
                className={classes.root}
                rowHeight={rowHeight}
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
            {detailsOptions && (
                <ViewMoreDialog
                    open={isViewMoreOpen}
                    onClose={closeViewMore}
                    expandedAccordion={detailsOptions.field}
                    row={detailsOptions.structure}
                    data={data}
                />
            )}
            <IDRDialog open={isIDROpen} onClose={closeIDR} idrOptions={idrOptions} />
        </div>
    );
});

type GridProp<Prop extends keyof DataGridProps> = NonNullable<DataGridProps[Prop]>;

interface FieldStructure {
    field: Field;
    structure: Structure;
}

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
    cstf: false,
    ceres: false,
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
