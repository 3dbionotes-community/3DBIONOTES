import React from "react";
import _ from "lodash";
import { makeStyles } from "@material-ui/core";
import { DataGrid, DataGridProps, GridSortModel } from "@material-ui/data-grid";
import { updateStructures } from "../../../domain/entities/Covid19Info";
import { getColumns, IDROptions, DetailsDialogOptions } from "./Columns";
import { Covid19Filter, Id } from "../../../domain/entities/Covid19Info";
import { Toolbar, ToolbarProps } from "./Toolbar";
import { useVirtualScrollbarForDataGrid } from "../VirtualScrollbar";
import { DataGrid as DataGridE } from "../../../domain/entities/DataGrid";
import { useAppContext } from "../../contexts/app-context";
import { DetailsDialog } from "./DetailsDialog";
import { sendAnalytics } from "../../../utils/analytics";
import { IDRDialog } from "./IDRDialog";
import { useInfoDialog } from "../../hooks/useInfoDialog";
import { CustomGridPagination, CustomGridPaginationProps } from "./CustomGridPagination";

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

    const {
        info: detailsInfo,
        useDialogState: detailsDialogState,
    } = useInfoDialog<DetailsDialogOptions>();
    const [isDetailsOpen, closeDetails, showDetailsDialog] = detailsDialogState;
    const { info: idrOptions, useDialogState: idrDialogState } = useInfoDialog<IDROptions>();
    const [isIDROpen, closeIDR, showIDRDialog] = idrDialogState;

    const [sortModel, setSortModel] = React.useState<GridSortModel>(defaultSort);
    const [filterState, setFilterState0] = React.useState(initialFilterState);

    const openDetailsDialog = React.useCallback(
        (options: DetailsDialogOptions, gaLabel: string) => {
            closeIDR();
            showDetailsDialog(options, gaLabel);
        },
        [closeIDR, showDetailsDialog]
    );

    const openIDRDialog = React.useCallback(
        (options: IDROptions, gaLabel: string) => {
            closeDetails();
            showIDRDialog(options, gaLabel);
        },
        [closeDetails, showIDRDialog]
    );

    const setFilterState = React.useCallback((value: React.SetStateAction<Covid19Filter>) => {
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

    const columns = React.useMemo(() => {
        return getColumns(data, {
            onClickDetails: openDetailsDialog,
            onClickIDR: openIDRDialog,
        });
    }, [data, openDetailsDialog, openIDRDialog]);

    const components = React.useMemo(
        () => ({ Toolbar: Toolbar, Pagination: CustomGridPagination }),
        []
    );

    const dataGrid = React.useMemo<DataGridE>(() => {
        return { columns: columns.base, structures };
    }, [columns, structures]);

    const componentsProps = React.useMemo<
        { toolbar: ToolbarProps; pagination: CustomGridPaginationProps } | undefined
    >(() => {
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
                      validationSources: data.validationSources,
                  },
                  pagination: {
                      dataGrid,
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
        data.validationSources,
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
            {detailsInfo && (
                <DetailsDialog
                    open={isDetailsOpen}
                    onClose={closeDetails}
                    expandedAccordion={detailsInfo.field}
                    row={detailsInfo.row}
                    data={data}
                    onClickIDR={openIDRDialog}
                />
            )}
            {idrOptions && (
                <IDRDialog open={isIDROpen} onClose={closeIDR} idrOptions={idrOptions} />
            )}
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
    cstf: false,
    ceres: false,
    idr: false,
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
