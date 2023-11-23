import _ from "lodash";
import React from "react";
import styled from "styled-components";
import {
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Typography,
    LinearProgress,
    CircularProgress,
} from "@material-ui/core";
import { GetApp } from "@material-ui/icons";
import { Dialog } from "./Dialog";
import { NMROptions, SetNMRPagination } from "./Columns";
import { NSPTarget } from "../../../domain/entities/Covid19Info";
import { NMRPagination } from "../../../domain/repositories/EntitiesRepository";
import i18n from "../../../utils/i18n";
import { useBooleanState } from "../../hooks/useBoolean";

export interface NMRDialogProps {
    onClose(): void;
    nmrOptions: NMROptions;
    open: boolean;
}

export const NMRDialog: React.FC<NMRDialogProps> = React.memo(props => {
    const { onClose, open } = props;
    const { target, error, pagination, setPagination, loading } = props.nmrOptions;

    const title = React.useMemo(
        () => i18n.t("Ligand interaction NMR: {{target}}", { target: target?.name ?? "" }),
        [target]
    );

    return (
        <StyledDialog
            open={open}
            onClose={onClose}
            title={title}
            fullWidth={true}
            maxWidth="xl"
            scroll="paper"
        >
            {loading && <StyledLinearProgress />}
            {error && <Typography>{error}</Typography>}
            {target && pagination && setPagination && (
                <>
                    {pagination.pageSize >= 25 && (
                        <Toolbar pagination={pagination} setPagination={setPagination} />
                    )}
                    <DialogContent target={target} />
                    <Toolbar pagination={pagination} setPagination={setPagination} />
                </>
            )}
        </StyledDialog>
    );
});

interface DialogContentProps {
    target: NSPTarget;
}

interface ToolbarProps {
    pagination: NMRPagination;
    setPagination: SetNMRPagination;
}

const Toolbar: React.FC<ToolbarProps> = React.memo(props => {
    const {
        pagination,
        setPagination: { setPage, setPageSize },
    } = props;
    const [isExporting, { enable: showExporting, disable: hideExporting }] = useBooleanState(true);

    const handleChangePage = React.useCallback(
        (_event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
            setPage(newPage);
        },
        [setPage]
    );

    const handleChangeRowsPerPage = React.useCallback(
        (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setPageSize(parseInt(event.target.value, 10));
            setPage(1);
        },
        [setPage, setPageSize]
    );

    return (
        <div style={styles.toolbar}>
            <div style={styles.exportButton}>
                <Button
                    variant={"outlined"}
                    disabled={isExporting}
                    color="inherit"
                    startIcon={<GetApp />}
                    size="small"
                >
                    {i18n.t("Export all fragments")}
                </Button>
                {isExporting && <StyledCircularProgress size={16} />}
            </div>
            <TablePagination
                component="div"
                count={pagination.count}
                page={pagination.page}
                onPageChange={handleChangePage}
                rowsPerPage={pagination.pageSize}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </div>
    );
});

const DialogContent: React.FC<DialogContentProps> = React.memo(({ target }) => {
    return (
        <TableContainer>
            <Table size="small" aria-label={i18n.t("Ligand interaction")}>
                <TableHead>
                    <StyledHeadTableRow>
                        <TableCell></TableCell>
                        <TableCell align="left">{i18n.t("Name")}</TableCell>
                        <TableCell align="left">{i18n.t("SMILES")}</TableCell>
                        <TableCell align="left">{i18n.t("InchiKey")}</TableCell>
                        <TableCell align="left">{i18n.t("Formula")}</TableCell>
                        <TableCell align="left">{i18n.t("PubChem_ID")}</TableCell>
                        <TableCell align="left">{i18n.t("Target")}</TableCell>
                        <TableCell align="left">{i18n.t("Result")}</TableCell>
                    </StyledHeadTableRow>
                </TableHead>
                <TableBody>
                    {_.sortBy(target.fragments, f => !f.binding).map((fragment, idx) => {
                        const {
                            binding,
                            ligand: { name: ligandName, smiles, inChI, formula, pubchemId },
                        } = fragment;

                        return (
                            <StyledTableRow key={idx} binding={binding}>
                                <TableCell>{idx}</TableCell>
                                <TableCell>{ligandName}</TableCell>
                                <TableCell align="left">{smiles}</TableCell>
                                <TableCell align="left">{inChI}</TableCell>
                                <TableCell align="left">{formula}</TableCell>
                                <TableCell align="left">{pubchemId}</TableCell>
                                <TableCell align="left">{target.name}</TableCell>
                                <TableCell align="left">
                                    {binding ? i18n.t("Binding") : i18n.t("Not binding")}
                                </TableCell>
                            </StyledTableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
});

const styles = {
    toolbar: { display: "flex", justifyContent: "space-between", paddingLeft: "1em" },
    exportButton: {
        display: "flex",
        alignItems: "center",
        color: "#607d8b",
        position: "relative",
        justifyContent: "center",
    },
} as const;

interface StyledTableRowProps {
    binding: boolean;
}

const StyledHeadTableRow = styled(TableRow)`
    background: #fff;
    & .MuiTableCell-root {
        border-bottom: unset;
    }
`;

const StyledTableRow = styled(StyledHeadTableRow)<StyledTableRowProps>`
    background: ${props => (props.binding ? "#dcedc8" : "#ffcdd2")};
    border: ${props => (props.binding ? "1px solid #9ccc65" : "1px solid #ef5350")};
`;

const StyledDialog = styled(Dialog)`
    .MuiDialogContent-root {
        padding: 0 !important;
        position: relative;
    }
`;

const StyledLinearProgress = styled(LinearProgress)`
    &.MuiLinearProgress-colorPrimary {
        background-color: #c6ece8;
    }
    & .MuiLinearProgress-barColorPrimary {
        background-color: #009688;
    }
`;

const StyledCircularProgress = styled(CircularProgress)`
    position: absolute;
    &.MuiCircularProgress-colorPrimary {
        color: #009688;
    }
`;
