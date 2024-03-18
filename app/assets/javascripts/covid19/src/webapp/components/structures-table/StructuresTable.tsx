import _ from "lodash";
import React from "react";
import styled from "styled-components";
import { LinearProgress, makeStyles } from "@material-ui/core";
import { DataGrid, DataGridProps, GridSortModel } from "@material-ui/data-grid";
import { Covid19Info } from "../../../domain/entities/Covid19Info";
import { getColumns, IDROptions, DetailsDialogOptions } from "./Columns";
import { Covid19Filter } from "../../../domain/entities/Covid19Info";
import { Toolbar, ToolbarProps } from "./Toolbar";
import { useVirtualScrollbarForDataGrid } from "../VirtualScrollbar";
import { DataGrid as DataGridE } from "../../../domain/entities/DataGrid";
import { useAppContext } from "../../contexts/app-context";
import { DetailsDialog } from "./DetailsDialog";
import { sendAnalytics } from "../../../utils/analytics";
import { IDRDialog } from "./IDRDialog";
import { useInfoDialog } from "../../hooks/useInfoDialog";
import { CustomGridPaginationProps } from "./CustomGridPagination";
import { useSnackbar } from "@eyeseetea/d2-ui-components/snackbar";
import { useBooleanState } from "../../hooks/useBoolean";
import { Skeleton } from "./Skeleton";
import { Footer } from "./Footer";
import i18n from "../../../utils/i18n";

export interface StructuresTableProps {
    search: string;
    highlighted: boolean;
    setSearch: (value: string) => void;
    setHighlight: (value: boolean) => void;
}

export const StructuresTable: React.FC<StructuresTableProps> = React.memo(props => {
    const { search, setSearch: setSearch0, highlighted, setHighlight } = props;
    const { compositionRoot } = useAppContext();
    const [isLoading, { enable: showLoading, disable: hideLoading }] = useBooleanState(true);
    const [showSkeleton, { disable: hideSkeleton }] = useBooleanState(true);
    const [
        slowLoading,
        { enable: enableSlowLoading, disable: disableSlowLoading },
    ] = useBooleanState(false);
    const [page, setPage] = React.useState(0);
    const [pageSize, setPageSize] = React.useState(pageSizes[0] ?? 10);
    const cancelLoadDataRef = React.useRef<SelfCancellable>(() => {});
    const classes = useStyles();
    const snackbar = useSnackbar();

    const {
        info: detailsInfo,
        useDialogState: detailsDialogState,
    } = useInfoDialog<DetailsDialogOptions>();
    const [isDetailsOpen, closeDetails, showDetailsDialog] = detailsDialogState;
    const { info: idrOptions, useDialogState: idrDialogState } = useInfoDialog<IDROptions>();
    const [isIDROpen, closeIDR, showIDRDialog] = idrDialogState;

    const [sortModel, setSortModel] = React.useState<GridSortModel>(noSort);
    const [filterState, setFilterState] = React.useState(initialFilterState);

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

    const {
        gridApi,
        virtualScrollbarProps,
        updateScrollBarFromStateChange,
    } = useVirtualScrollbarForDataGrid();

    const onStateChange = React.useCallback<NonNullable<DataGridProps["onStateChange"]>>(
        params => {
            updateScrollBarFromStateChange(params);
        },
        [updateScrollBarFromStateChange]
    );

    const [data, setData] = React.useState<Covid19Info>({
        count: 0,
        structures: [],
        validationSources: [],
    });

    const stopLoading = React.useCallback(() => {
        hideSkeleton();
        hideLoading();
        disableSlowLoading();
    }, [hideLoading, disableSlowLoading, hideSkeleton]);

    const getData = React.useCallback(
        (page: number, pageSize: number, onSuccess?: () => void) => {
            showLoading();
            if (pageSize > 25) enableSlowLoading();

            const sort =
                sortModel[0] && sortFieldSupported(sortModel[0].field) && sortModel[0].sort
                    ? {
                          field: sortModel[0].field,
                          order: sortModel[0].sort,
                      }
                    : ({ field: "releaseDate", order: "desc" } as const);

            const cancelGetData = compositionRoot.getCovid19Info
                .execute({ page, pageSize, filter: filterState, sort })
                .bitap(() => stopLoading())
                .run(
                    data => {
                        setData(data);
                        onSuccess && onSuccess();
                        cancelLoadDataRef.current = () => {};
                    },
                    err => {
                        console.error(err.message);
                        snackbar.error(err.message);
                        cancelLoadDataRef.current = () => {};
                    }
                );

            const cancelData = (self = false) => {
                if (!self) {
                    stopLoading();
                    snackbar.info(i18n.t("Request has been cancelled"), { autoHideDuration: 2000 });
                }
                cancelGetData();
            };

            cancelLoadDataRef.current = cancelData;

            return cancelData;
        },
        [
            compositionRoot,
            stopLoading,
            enableSlowLoading,
            showLoading,
            snackbar,
            filterState,
            sortModel,
        ]
    );

    const changePage = React.useCallback(
        (newPage: number) => {
            if (cancelLoadDataRef.current) {
                cancelLoadDataRef.current(true);
            }
            getData(newPage, pageSize, () => setPage(newPage));
        },
        [setPage, pageSize, getData]
    );

    const changePageSize = React.useCallback(
        (pageSize: number) => {
            if (cancelLoadDataRef.current) {
                cancelLoadDataRef.current(true);
            }
            getData(0, pageSize, () => {
                setPageSize(pageSize);
                setPage(0);
            });
        },
        [setPage, getData]
    );

    const setSearch = React.useCallback(
        (value: string) => {
            changePage(0);
            sendAnalytics("search", {
                on: "covid_table",
                query: value,
            });
            setSearch0(value);
            setSortModel(sort => (value ? noSort : sort));
        },
        [setSearch0, changePage]
    );

    window.app = { data };
    const filteredData = data;
    const { structures } = filteredData;

    const columns = React.useMemo(() => {
        return getColumns(data, {
            onClickDetails: openDetailsDialog,
            onClickIDR: openIDRDialog,
        });
    }, [data, openDetailsDialog, openIDRDialog]);

    const components = React.useMemo(
        () => ({ Toolbar: Toolbar, Footer: Footer, LoadingOverlay: Skeleton }),
        []
    );

    const dataGrid = React.useMemo<DataGridE>(() => {
        return { columns: columns.base, structures };
    }, [columns, structures]);

    const componentsProps = React.useMemo<
        | {
              toolbar: ToolbarProps;
              footer: CustomGridPaginationProps;
          }
        | undefined
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
                      setPage: changePage,
                      setPageSize: changePageSize,
                      isLoading,
                      slowLoading,
                      count: data.count,
                      cancelRequest: () => cancelLoadDataRef.current && cancelLoadDataRef.current(), //wrapper
                      validationSources: data.validationSources,
                  },
                  footer: {
                      dataGrid,
                      page,
                      pageSize,
                      pageSizes,
                      setPage: changePage,
                      setPageSize: changePageSize,
                      isLoading,
                      count: data.count,
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
        data.validationSources,
        isLoading,
        slowLoading,
        changePage,
        changePageSize,
        data.count,
    ]);

    const resetPageAndSorting = React.useCallback<GridProp<"onSortModelChange">>(modelParams => {
        setSortModel(modelParams.sortModel);
    }, []);

    const onFilterStateChange = () => {
        changePage(0);
    };

    React.useEffect(onFilterStateChange, [filterState, changePage]);

    return (
        <div className={classes.wrapper}>
            <DataGrid
                paginationMode="server"
                sortingMode="server"
                filterMode="server"
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
                loading={showSkeleton}
                headerHeight={headerHeight}
                components={components}
                componentsProps={componentsProps}
            />
            {isLoading && <StyledLinearProgress position="bottom" />}
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
export type SelfCancellable = (self?: boolean) => void;

const noSort: GridSortModel = [];

const useStyles = makeStyles({
    root: {
        "&.MuiDataGrid-root .MuiDataGrid-cell": {
            whiteSpace: "normal",
            display: "flex", // "flex": center vertically. "block" otherwise
        },
        "&.MuiDataGrid-root": {
            borderTop: "none",
            borderRadius: "0 0 4px 4px",
        },
        "&.MuiDataGrid-root .MuiDataGrid-cellWithRenderer": {},
    },
    wrapper: {
        position: "relative",
    },
});

const pageSizes = [10, 25, 50, 75, 100];

export const rowHeight = 220;
export const headerHeight = 56;

const sortingOrder = ["asc" as const, "desc" as const, null];

const initialFilterState: Covid19Filter = {
    antibodies: false,
    nanobodies: false,
    sybodies: false,
    pdbRedo: false,
    cstf: false,
    ceres: false,
    idr: false,
};

function sortFieldSupported(field: string): field is "pdb" | "title" | "emdb" | "releaseDate" {
    return ["pdb", "title", "emdb", "releaseDate"].includes(field);
}

const StyledLinearProgress = styled(LinearProgress)<{ position: "top" | "bottom" }>`
    &.MuiLinearProgress-root {
        position: absolute;
        ${props => props.position}: 0;
        width: 100%;
    }
    &.MuiLinearProgress-colorPrimary {
        background-color: #c6ece8;
    }
    & .MuiLinearProgress-barColorPrimary {
        background-color: #009688;
    }
`;
