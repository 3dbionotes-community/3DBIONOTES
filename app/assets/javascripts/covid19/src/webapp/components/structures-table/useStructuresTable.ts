import React, { ReactNode } from "react";
import { DataGridProps, GridSortModel } from "@material-ui/data-grid";
import { StructuresTableProps } from "./StructuresTable";
import { useAppContext } from "../../contexts/app-context";
import { Covid19Filter, Covid19Info } from "../../../domain/entities/Covid19Info";
import i18n from "../../../utils/i18n";

type Props = StructuresTableProps & {
    notice: NoticeState;
    showLoading: () => void;
    stopLoading: () => void;
    enableCancellable: () => void;
};

export function useStructuresTable(props: Props) {
    const {
        search,
        setSearch: setSearch0,
        highlighted,
        setHighlight,
        notice,
        showLoading,
        stopLoading,
        enableCancellable,
    } = props;

    const { compositionRoot } = useAppContext();

    //data
    const [data, setData] = React.useState<Covid19Info>({
        count: 0,
        structures: [],
        validationSources: [],
    });

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
                        notice.error(err.message);
                        cancelLoadDataRef.current = () => {};
                    }
                );

            const cancelData = (self = false) => {
                if (!self) {
                    stopLoading();
                    notice.info(i18n.t("Request has been cancelled"), { autoHideDuration: 2000 });
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
            notice,
            filterState,
            sortModel,
            search,
        ]
    );

    return {
        compositionRoot,
        data,
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
        getData,
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

function sortFieldSupported(field: string): field is "pdb" | "title" | "emdb" | "releaseDate" {
    return ["pdb", "title", "emdb", "releaseDate"].includes(field);
}

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
