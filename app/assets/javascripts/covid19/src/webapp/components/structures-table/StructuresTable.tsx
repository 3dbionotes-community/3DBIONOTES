import _ from "lodash";
import React from "react";
import styled from "styled-components";
import { LinearProgress, makeStyles } from "@material-ui/core";
import { DataGrid } from "@material-ui/data-grid";
import { useSnackbar } from "@eyeseetea/d2-ui-components/snackbar";
import { getColumns, IDROptions, DetailsDialogOptions } from "./Columns";
import { Toolbar, ToolbarProps } from "./Toolbar";
import { useVirtualScrollbarForDataGrid } from "../VirtualScrollbar";
import { DataGrid as DataGridE } from "../../../domain/entities/DataGrid";
import { useAppContext } from "../../contexts/app-context";
import { DetailsDialog } from "./DetailsDialog";
import { sendAnalytics as _sendAnalytics } from "../../../utils/analytics";
import { IDRDialog } from "./IDRDialog";
import { useInfoDialog } from "../../hooks/useInfoDialog";
import { CustomGridPaginationProps } from "./CustomGridPagination";
import { Skeleton } from "./Skeleton";
import { Footer } from "./Footer";
import { pageSizes, useStructuresTable } from "./useStructuresTable";
import { useBooleanState } from "../../hooks/useBoolean";
import i18n from "../../../utils/i18n";

export interface StructuresTableProps {
    search: string;
    highlighted: boolean;
    setSearch: (value: string) => void;
    setHighlight: (value: boolean) => void;
}

export const StructuresTable: React.FC<StructuresTableProps> = React.memo(props => {
    const { search, highlighted, setHighlight } = props;
    const { compositionRoot } = useAppContext();
    const classes = useStyles();
    const snackbar = useSnackbar();

    const { main, skeleton, cancellable, stop: stopLoading } = useUILoaders();
    const { loading: isLoading, show: showLoading } = main;
    const { loading: isSkeletonLoading } = skeleton;
    const { loading: isCancellable, show: enableCancellable } = cancellable;

    const {
        data,
        setData,
        page,
        setPage,
        pageSize,
        setPageSize,
        sortModel,
        filterState,
        setFilterState,
        cancelLoadDataRef,
        setSearch,
        resetPageAndSorting,
    } = useStructuresTable({ ...props, noticer: snackbar });

    const { details, idr } = useStructuresTableDialogs();
    const {
        isOpen: isDetailsOpen,
        open: openDetailsDialog,
        close: closeDetails,
        data: detailsInfo,
    } = details;
    const { isOpen: isIDROpen, open: openIDRDialog, close: closeIDR, data: idrOptions } = idr;

    const {
        gridApi,
        virtualScrollbarProps,
        updateScrollBarFromStateChange,
    } = useVirtualScrollbarForDataGrid();

    const onStateChange = updateScrollBarFromStateChange;

    const getData = React.useCallback(
        (page: number, pageSize: number, onSuccess?: () => void) => {
            showLoading();
            if (pageSize > 25) enableCancellable();

            const sort =
                sortModel[0] && sortFieldSupported(sortModel[0].field) && sortModel[0].sort
                    ? {
                          field: sortModel[0].field,
                          order: sortModel[0].sort,
                      }
                    : ({ field: "releaseDate", order: "desc" } as const);

            const cancelGetData = compositionRoot.getCovid19Info
                .execute({ page, pageSize, filter: filterState, sort, query: search })
                .bitap(stopLoading, stopLoading)
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
            enableCancellable,
            showLoading,
            snackbar,
            filterState,
            sortModel,
            search,
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
                      slowLoading: isCancellable,
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
        isCancellable,
        changePage,
        changePageSize,
        data.count,
    ]);

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
                loading={isSkeletonLoading}
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

function useStructuresTableDialogs() {
    const {
        info: detailsInfo,
        useDialogState: detailsDialogState,
    } = useInfoDialog<DetailsDialogOptions>();
    const [isDetailsOpen, closeDetails, showDetailsDialog] = detailsDialogState;

    const { info: idrOptions, useDialogState: idrDialogState } = useInfoDialog<IDROptions>();
    const [isIDROpen, closeIDR, showIDRDialog] = idrDialogState;

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

    return {
        details: {
            isOpen: isDetailsOpen,
            open: openDetailsDialog,
            close: closeDetails,
            data: detailsInfo,
        },
        idr: {
            isOpen: isIDROpen,
            open: openIDRDialog,
            close: closeIDR,
            data: idrOptions,
        },
    };
}

function useUILoaders() {
    const [isLoading, { enable: showLoading, disable: hideLoading }] = useBooleanState(true);
    const [isSkeletonLoading, { disable: hideSkeleton }] = useBooleanState(true);
    const [
        isCancellable,
        { enable: enableCancellable, disable: disableCancellable },
    ] = useBooleanState(false);

    const stopLoading = React.useCallback(() => {
        hideSkeleton();
        hideLoading();
        disableCancellable();
    }, [hideLoading, disableCancellable, hideSkeleton]);

    return {
        main: {
            loading: isLoading,
            show: showLoading,
        },
        skeleton: {
            loading: isSkeletonLoading,
        },
        cancellable: {
            loading: isCancellable,
            show: enableCancellable,
        },
        stop: stopLoading,
    };
}

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

export const rowHeight = 220;
export const headerHeight = 56;

const sortingOrder = ["asc" as const, "desc" as const, null];

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
