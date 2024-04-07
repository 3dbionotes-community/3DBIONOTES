import React, { ReactNode } from "react";
import { DataGridProps, GridSortModel } from "@material-ui/data-grid";
import { StructuresTableProps } from "./StructuresTable";
import { useAppContext } from "../../contexts/app-context";
import { Covid19Filter } from "../../../domain/entities/Covid19Info";

export function useStructuresTable(props: StructuresTableProps & { noticer: NoticeState }) {
    const { search, setSearch: setSearch0, highlighted, setHighlight, noticer } = props;

    const { compositionRoot } = useAppContext();

    //paging
    const [page, setPage] = React.useState(0);
    const [pageSize, setPageSize] = React.useState(pageSizes[0] ?? 10);

    //sort filter
    const [sortModel, setSortModel] = React.useState<GridSortModel>(noSort);
    const [filterState, setFilterState] = React.useState(initialFilterState);

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
        cancelLoadDataRef,
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

type NoticeLevel = "success" | "info" | "warning" | "error";
type Message = ReactNode;

export interface NotifyUserOptions {
    isOpen: boolean;
    message?: Message;
    variant?: NoticeLevel;
    autoHideDuration?: number | null;
}

type NoticeState = {
    [level in NoticeLevel]: (message: Message, options?: Partial<NotifyUserOptions>) => void;
};
