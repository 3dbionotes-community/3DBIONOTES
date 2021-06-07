import React from "react";
import {
    ObjectsTable,
    TableColumn,
    TableSorting,
    ReferenceObject,
    PaginationOptions,
    TablePagination,
    TableState,
} from "d2-ui-components";
import { LinearProgress } from "material-ui";
import { Spinner } from "./Spinner";
import { makeStyles } from "@material-ui/core";

export interface ObjectsListProps<Row extends ReferenceObject> {
    isLoading: boolean;
    rows: Row[] | undefined;
    columns: TableColumn<Row>[];
    pagination: Partial<TablePagination>;
    paginationOptions: Partial<PaginationOptions>;
    initialPagination: Partial<TablePagination>;
    initialSorting: TableSorting<Row>;
    onStateChange(newState: TableState<Row>): void;
}

export function ObjectsList<T extends ReferenceObject>(
    props: ObjectsListProps<T>
): React.ReactElement<ObjectsListProps<T>> {
    const { isLoading, rows, ...tableProps } = props;
    const classes = useStyles();

    return (
        <div className={classes.wrapper}>
            {isLoading ? <span data-test-loading /> : <span data-test-loaded />}
            {!rows && <LinearProgress />}
            {rows && (
                <ObjectsTable<T>
                    rows={rows}
                    {...tableProps}
                    filterComponents={
                        <React.Fragment key="filters">
                            {/*<ProjectsListFilters
                                filter={filter}
                                filterOptions={filterOptions}
                                onChange={setFilter}
                            />*/}

                            <Spinner isVisible={isLoading} />
                        </React.Fragment>
                    }
                />
            )}
        </div>
    );
}

const useStyles = makeStyles({
    wrapper: { marginTop: 25 },
});
