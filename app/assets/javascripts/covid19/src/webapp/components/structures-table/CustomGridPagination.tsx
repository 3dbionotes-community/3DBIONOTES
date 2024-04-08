import React from "react";
import TablePagination from "@material-ui/core/TablePagination";
import { useSnackbar } from "@eyeseetea/d2-ui-components/snackbar";
import { useBooleanState } from "../../hooks/useBoolean";
import { makeStyles } from "@material-ui/styles";

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
    const [showInfo, { disable: hideInfo }] = useBooleanState(true);
    const snackbar = useSnackbar();
    const classes = useStyles();

    const maxPage = Math.ceil(count / (pageSize ?? 10));

    const setPageFromEvent = React.useCallback(
        (_event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
            setPage(newPage);
        },
        [setPage]
    );

    const changePageSize = React.useCallback(
        (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const pageSize = parseInt(event.target.value, 10);
            if (pageSize > 25 && showInfo) {
                snackbar.info("Please note that larger page size may take longer to load.");
                hideInfo();
            }
            setPageSize(pageSize);
        },
        [setPageSize, snackbar, showInfo, hideInfo]
    );

    return (
        <React.Fragment>
            <TablePagination
                component="div" /* Default component is td, but we the parent component is not a table */
                className={classes.table}
                count={count}
                page={page}
                onPageChange={setPageFromEvent}
                rowsPerPageOptions={pageSizes}
                rowsPerPage={pageSize || 10}
                onRowsPerPageChange={changePageSize}
                backIconButtonProps={{ disabled: isLoading || page === 0 }}
                nextIconButtonProps={{ disabled: isLoading || page === maxPage - 1 }}
                SelectProps={{ disabled: isLoading }}
            />
        </React.Fragment>
    );
});

const useStyles = makeStyles({
    table: { borderBottom: "none", padding: 0 },
});
