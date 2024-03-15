import React from "react";
import TablePagination from "@material-ui/core/TablePagination";
import { useSnackbar } from "@eyeseetea/d2-ui-components/snackbar";
import { useBooleanState } from "../../hooks/useBoolean";

export interface CustomGridPaginationProps {
    count: number;
    page: number;
    pageSize: number | undefined;
    pageSizes: number[];
    isLoading: boolean;
    setPageSize: (pageSize: number) => void;
    setPage: (newPage: number) => void;
}

export const CustomGridPagination: React.FC<CustomGridPaginationProps> = React.memo(props => {
    const { count, page, pageSize, pageSizes, setPage, setPageSize, isLoading } = props;
    const [showInfo, { disable }] = useBooleanState(true);
    const snackbar = useSnackbar();

    const onPageChange = React.useCallback(
        (_event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
            setPage(newPage);
        },
        [setPage]
    );

    const onPageSizeChange = React.useCallback(
        (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const pageSize = parseInt(event.target.value, 10);
            if (pageSize > 25 && showInfo) {
                snackbar.info("Please note that larger page size may take longer to load.");
                disable();
            }
            setPageSize(pageSize);
        },
        [setPageSize, snackbar, showInfo, disable]
    );

    return (
        <React.Fragment>
            <TablePagination
                component="div" /* Default component is td, but we the parent component is not a table */
                style={styles.table}
                count={count}
                page={page}
                onPageChange={onPageChange}
                rowsPerPageOptions={pageSizes}
                rowsPerPage={pageSize || 10}
                onRowsPerPageChange={onPageSizeChange}
                backIconButtonProps={{ disabled: isLoading }}
                nextIconButtonProps={{ disabled: isLoading }}
                SelectProps={{ disabled: isLoading }}
            />
        </React.Fragment>
    );
});

const styles = {
    table: { borderBottom: "none" as const, padding: 0 },
};
