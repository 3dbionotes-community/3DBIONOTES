import React from "react";
import {
    TableColumn,
    TableSorting,
    ReferenceObject,
    PaginationOptions,
    TablePagination,
    ObjectsTableDetailField,
    TableState,
} from "d2-ui-components";
import { ObjectsListProps } from "./ObjectsList";

export interface Config<Row extends ReferenceObject> {
    columns: TableColumn<Row>[];
    paginationOptions: Partial<PaginationOptions>;
    initialPagination: Partial<TablePagination>;
    initialSorting: TableSorting<Row>;
    details: ObjectsTableDetailField<Row>[];
    getRows(): Promise<{ objects: Row[]; pager: Partial<TablePagination> }>;
}

export function useObjectsTable<T extends ReferenceObject>(config: Config<T>): ObjectsListProps<T> {
    const [rows, setRows] = React.useState<T[] | undefined>(undefined);
    const [pagination, setPagination] = React.useState<Partial<TablePagination>>(
        config.initialPagination
    );
    const [sorting, setSorting] = React.useState<TableSorting<T>>(config.initialSorting);
    const [isLoading, setLoading] = React.useState(true);

    const loadRows = React.useCallback(
        async (sorting: TableSorting<T>, paginationOptions: Partial<TablePagination>) => {
            const listPagination = { ...paginationOptions };
            setLoading(true);
            const res = await config.getRows();
            setRows(res.objects);
            setPagination({ ...listPagination, ...res.pager });
            setSorting(sorting);
            setLoading(false);
        },
        [config]
    );

    React.useEffect(() => {
        loadRows(sorting, { ...config.initialPagination, page: 1 });
    }, [loadRows, sorting, config.initialPagination]);

    const onStateChange = React.useCallback(
        (newState: TableState<T>) => {
            const { pagination, sorting } = newState;
            loadRows(sorting, pagination);
        },
        [loadRows]
    );

    return { ...config, isLoading, rows, onStateChange, pagination };
}
