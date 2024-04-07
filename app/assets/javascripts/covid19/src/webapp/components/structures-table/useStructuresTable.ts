import React from "react";
import { useSnackbar } from "@eyeseetea/d2-ui-components/snackbar";
import { DataGridProps, GridSortModel } from "@material-ui/data-grid";
import { StructuresTableProps } from "./StructuresTable";
import { useAppContext } from "../../contexts/app-context";
import { useBooleanState } from "../../hooks/useBoolean";
import { Covid19Filter } from "../../../domain/entities/Covid19Info";

export function useStructuresTable(props: StructuresTableProps) {
    const { search, setSearch: setSearch0, highlighted, setHighlight } = props;

    const { compositionRoot } = useAppContext();
    const snackbar = useSnackbar();

    //paging
    const [page, setPage] = React.useState(0);
    const [pageSize, setPageSize] = React.useState(pageSizes[0] ?? 10);

    //sort filter
    const [sortModel, setSortModel] = React.useState<GridSortModel>(noSort);
    const [filterState, setFilterState] = React.useState(initialFilterState);

    //loading indicators
    const [isLoading, { enable: showLoading, disable: hideLoading }] = useBooleanState(true);
    const [showSkeleton, { disable: hideSkeleton }] = useBooleanState(true);
    const [
        slowLoading,
        { enable: enableSlowLoading, disable: disableSlowLoading },
    ] = useBooleanState(false);

    //cancel get request
    const cancelLoadDataRef = React.useRef<SelfCancellable>(() => {});

    const setSearch = React.useCallback(
        (value: string) => {
            // ANALYTICS TO BE REBUILD
            // sendAnalytics("search", {
            //     on: "covid_table",
            //     query: value,
            // });
            setSearch0(value);
            setSortModel(sort => (value ? noSort : sort));
        },
        [setSearch0]
    );

    const resetPageAndSorting = React.useCallback<GridProp<"onSortModelChange">>(modelParams => {
        setSortModel(modelParams.sortModel);
    }, []);

    return {
        compositionRoot,
        page,
        setPage,
        pageSize,
        setPageSize,
        sortModel,
        filterState,
        setFilterState,
        isLoading,
        showLoading,
        hideLoading,
        showSkeleton,
        hideSkeleton,
        slowLoading,
        enableSlowLoading,
        disableSlowLoading,
        cancelLoadDataRef,
        snackbar,
        setSearch,
        resetPageAndSorting,
    };
}

export const pageSizes = [10, 25, 50, 75, 100];
const noSort: GridSortModel = [];

export const initialFilterState: Covid19Filter = {
    antibodies: false,
    nanobodies: false,
    sybodies: false,
    pdbRedo: false,
    cstf: false,
    ceres: false,
    idr: false,
};

type GridProp<Prop extends keyof DataGridProps> = NonNullable<DataGridProps[Prop]>;
export type SelfCancellable = (self?: boolean) => void;
