import _ from "lodash";
import React from "react";
import styled from "styled-components";
import { LinearProgress, makeStyles } from "@material-ui/core";
import { DataGrid } from "@material-ui/data-grid";
import { useSnackbar } from "@eyeseetea/d2-ui-components/snackbar";
import { Covid19Info } from "../../../domain/entities/Covid19Info";
import { getColumns, IDROptions, DetailsDialogOptions } from "./Columns";
import { Toolbar, ToolbarProps } from "./Toolbar";
import { useVirtualScrollbarForDataGrid } from "../VirtualScrollbar";
import { DataGrid as DataGridE } from "../../../domain/entities/DataGrid";
import { DetailsDialog } from "./DetailsDialog";
import { sendAnalytics as _sendAnalytics } from "../../../utils/analytics";
import { IDRDialog } from "./IDRDialog";
import { useInfoDialog } from "../../hooks/useInfoDialog";
import { CustomGridPaginationProps } from "./CustomGridPagination";
import { Skeleton } from "./Skeleton";
import { Footer } from "./Footer";
import { pageSizes, useStructuresTable } from "./useStructuresTable";
import { useBooleanState } from "../../hooks/useBoolean";

export interface StructuresTableProps {
    search: string;
    highlighted: boolean;
    setSearch: (value: string) => void;
    setHighlight: (value: boolean) => void;
}

export const StructuresTable: React.FC<StructuresTableProps> = React.memo(props => {
    const { search, highlighted, setHighlight } = props;
    const classes = useStyles();
    const snackbar = useSnackbar();

    const { main, skeleton, cancellable, stop: stopLoading } = useUILoaders();
    const { loading: isLoading, show: showLoading } = main;
    const { loading: isSkeletonLoading } = skeleton;
    const { loading: isCancellable, show: enableCancellable } = cancellable;

    const structuresTableProps = {
        ...props,
        notice: snackbar,
        showLoading,
        enableCancellable,
        stopLoading,
    };

    const {
        data,
        page,
        pageSize,
        sortModel,
        filterState,
        setFilterState,
        cancelRequest,
        setSearch,
        resetPageAndSorting,
        changePage,
        changePageSize,
    } = useStructuresTable(structuresTableProps);

    const { structures } = data;

    const { detailsDialog, idrDialog, columns, components, dataGrid } = useStructuresTableUI(data);
    const { isOpen: isDetailsOpen, close: closeDetails, data: detailsInfo } = detailsDialog;
    const { isOpen: isIDROpen, open: openIDRDialog, close: closeIDR, data: idrOptions } = idrDialog;

    const {
        gridApi,
        virtualScrollbarProps,
        updateScrollBarFromStateChange,
    } = useVirtualScrollbarForDataGrid();

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
                      cancelRequest: () => cancelRequest.current && cancelRequest.current(), //wrapper
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
        cancelRequest,
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
                onStateChange={updateScrollBarFromStateChange}
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

function useStructuresTableUI(data: Covid19Info) {
    const { structures } = data;
    window.app = { data };

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

    return {
        detailsDialog: {
            isOpen: isDetailsOpen,
            open: openDetailsDialog,
            close: closeDetails,
            data: detailsInfo,
        },
        idrDialog: {
            isOpen: isIDROpen,
            open: openIDRDialog,
            close: closeIDR,
            data: idrOptions,
        },
        columns,
        components,
        dataGrid,
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
