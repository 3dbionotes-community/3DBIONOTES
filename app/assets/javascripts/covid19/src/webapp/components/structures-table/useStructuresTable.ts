import React, { ReactNode } from "react";
import { DataGridProps, GridSortModel } from "@material-ui/data-grid";
import { StructuresTableProps } from "./StructuresTable";
import { useAppContext } from "../../contexts/app-context";
import { Covid19Filter, Covid19Info } from "../../../domain/entities/Covid19Info";
import i18n from "../../../utils/i18n";
import { isElementOfUnion } from "../../../data/utils/ts-utils";

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
    const [page, setPage] = React.useState(1);
    const pageSize = React.useRef(pageSizes[0] ?? 10);

    //sort filter
    const [sortModel, setSortModel] = React.useState<GridSortModel>(noSort);
    const [filterState, setFilterState] = React.useState(initialFilterState);

    //cancel get request
    const cancelLoadDataRef: React.MutableRefObject<SelfCancellable> = React.useRef(() => {});

    const setSearch = React.useCallback(
        (value: string) => {
            // ANALYTICS TO BE REBUILD
            // sendAnalytics("search", {
            //     on: "covid_table",
            //     query: value,
            // });
            setSearch0(value.toLowerCase());
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
            const sortOption = sortModel[0];

            const sort =
                sortOption && isElementOfUnion(sortOption.field, sortingFields) && sortOption.sort
                    ? {
                          field: sortOption.field,
                          order: sortOption.sort,
                      }
                    : ({ field: "releaseDate", order: "desc" } as const);

            const cancelGetData = compositionRoot.getCovid19Info
                .execute({ page, pageSize, filter: filterState, sort, query: search })
                .run(
                    data => {
                        setData(data);
                        onSuccess && onSuccess();
                        cancelLoadDataRef.current = () => {};
                        stopLoading();
                    },
                    err => {
                        console.error(err.message);
                        notice.error(err.message);
                        cancelLoadDataRef.current = () => {};
                        stopLoading();
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

    const changePage = React.useCallback(
        (newPage: number) => {
            if (cancelLoadDataRef.current) {
                cancelLoadDataRef.current(true);
            }
            getData(newPage, pageSize.current, () => setPage(newPage));
        },
        [setPage, getData]
    );

    const changePageSize = React.useCallback(
        (size: number) => {
            if (cancelLoadDataRef.current) {
                cancelLoadDataRef.current(true);
            }
            getData(1, size, () => {
                pageSize.current = size;
                setPage(1);
            });
        },
        [setPage, getData]
    );

    const resetPage = React.useCallback(() => {
        changePage(1);
    }, [changePage]);

    React.useEffect(resetPage, [filterState, resetPage]);

    return {
        compositionRoot,
        data,
        page,
        pageSize: pageSize.current,
        sortModel,
        filterState,
        setFilterState,
        cancelRequest: cancelLoadDataRef,
        setSearch,
        resetPageAndSorting,
        changePage,
        changePageSize,
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
    nmr: false,
};

const sortingFields = ["pdb", "title", "emdb", "releaseDate"] as const;

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
