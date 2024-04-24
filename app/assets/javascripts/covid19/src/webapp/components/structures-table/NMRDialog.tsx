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
    Paper,
} from "@material-ui/core";
import { GetApp, Stop as StopIcon } from "@material-ui/icons";
import { Dialog } from "./Dialog";
import { NMROptions, SetNMRPagination } from "./Columns";
import { NSPTarget, getValidationSource } from "../../../domain/entities/Covid19Info";
import { NMRPagination } from "../../../domain/repositories/EntitiesRepository";
import { useBooleanState } from "../../hooks/useBoolean";
import { useAppContext } from "../../contexts/app-context";
import { NoBulletListItem as ListItem } from "./IDRDialog";
import { Cancel } from "../../../data/utils/future";
import i18n from "../../../utils/i18n";

export interface NMRDialogProps {
    onClose(): void;
    nmrOptions: NMROptions;
    open: boolean;
}

export const NMRDialog: React.FC<NMRDialogProps> = React.memo(props => {
    const { onClose, open } = props;
    const { target, error, pagination, setPagination, loading } = props.nmrOptions;
    const { compositionRoot, sources } = useAppContext();
    const [isExporting, { enable: showExporting, disable: hideExporting }] = useBooleanState(false);

    const nmrSource = React.useMemo(() => getValidationSource(sources, "NMR"), [sources]);
    const nmrMethod = nmrSource?.methods[0];

    const title = React.useMemo(
        () => `${i18n.t("NMR-based fragment screening on")}: ${target?.name ?? ""}`,
        [target]
    );

    const saveTarget = React.useCallback(() => {
        if (target) {
            showExporting();
            return compositionRoot.entities.saveNMR.execute(target).run(
                () => {
                    hideExporting();
                },
                err => {
                    console.error(err);
                    hideExporting();
                }
            );
        }
    }, [target, compositionRoot, hideExporting, showExporting]);

    const nmrReference = nmrSource && nmrMethod && (
        <List>
            <ListItem name={"Description"} value={nmrMethod.description} />
            <ListItem name={"Evidence"}>
                <span>
                    <a href={nmrMethod.externalLink} target="_blank" rel="noreferrer noopener">
                        {nmrMethod.externalLink}
                    </a>
                </span>
            </ListItem>
            <ListItem name={"Source"} value={nmrSource.description} />
        </List>
    );

    const fragmentsTable = target && pagination && setPagination && saveTarget && (
        <Content elevation={3}>
            {loading && pagination.pageSize >= 25 && <StyledLinearProgress />}
            <DialogContent target={target} pagination={pagination} />
            <Toolbar
                pagination={pagination}
                setPagination={setPagination}
                saveTarget={saveTarget}
                isExporting={isExporting}
                hideExporting={hideExporting}
            />
            <div style={styles.bottomProgress}>{loading && <StyledLinearProgress />}</div>
        </Content>
    );

    return (
        <StyledDialog
            open={open}
            onClose={onClose}
            title={title}
            fullWidth={true}
            maxWidth={error ? "xs" : "xl"}
            scroll="paper"
        >
            {error && (
                <Typography>
                    <div style={{ margin: 16 }}>{error}</div>
                </Typography>
            )}
            {nmrReference}
            {fragmentsTable}
        </StyledDialog>
    );
});

interface DialogContentProps {
    target: NSPTarget;
    pagination: NMRPagination;
}

interface ToolbarProps {
    pagination: NMRPagination;
    setPagination: SetNMRPagination;
    saveTarget: () => Cancel | undefined;
    hideExporting: () => void;
    isExporting: boolean;
}

const Toolbar: React.FC<ToolbarProps> = React.memo(props => {
    const {
        pagination,
        setPagination: { setPage, setPageSize },
        isExporting,
        saveTarget,
        hideExporting,
    } = props;
    const [saving, setSaving] = React.useState<Cancel>();

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

    const onClick = React.useCallback(() => {
        if (isExporting) return;
        const cancel = saveTarget();
        setSaving(_saving => cancel);
    }, [isExporting, saveTarget]);

    const stopSaving = React.useCallback(() => {
        saving && saving();
        hideExporting();
    }, [hideExporting, saving]);

    return (
        <div style={styles.toolbar}>
            <ExportButton isProcessing={isExporting} onClick={onClick} stop={stopSaving} />
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

interface ExportButtonProps {
    isProcessing: boolean;
    onClick: () => void;
    stop: () => void;
}

const ExportButton: React.FC<ExportButtonProps> = React.memo(({ isProcessing, onClick, stop }) => (
    <div style={styles.exportButton}>
        <Button
            variant="outlined"
            disabled={isProcessing}
            color="inherit"
            startIcon={<GetApp />}
            size="small"
            onClick={onClick}
            style={{ opacity: isProcessing ? 0.5 : 1 }}
        >
            {i18n.t("Export all fragments")}
        </Button>

        {isProcessing && (
            <div style={styles.exportStopButton} onClick={stop}>
                <StyledCircularProgress size={20} />
                <StopIcon color="inherit" style={styles.stop} />
            </div>
        )}
    </div>
));

const DialogContent: React.FC<DialogContentProps> = React.memo(({ target, pagination }) => {
    const headers = ["Name", "SMILES", "InchiKey", "Formula", "PubChem_ID", "Target", "Result"];
    const Headers = headers.map((h, idx) => (
        <TableCell align="left" key={idx}>
            {h}
        </TableCell>
    ));

    const Items = _.sortBy(target.fragments, f => !f.binding).map((fragment, idx) => {
        const {
            binding,
            ligand: { name: ligandName, smiles, inChI, formula, pubchemId },
        } = fragment;

        return (
            <StyledTableRow key={idx} binding={binding}>
                <TableCell>{pagination.pageSize * pagination.page + idx + 1}</TableCell>
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
    });

    return (
        <TableContainer>
            <Table size="small" aria-label={i18n.t("Ligand interaction")}>
                <TableHead>
                    <StyledHeadTableRow>
                        <TableCell></TableCell>
                        {Headers}
                    </StyledHeadTableRow>
                </TableHead>
                <TableBody>{Items}</TableBody>
            </Table>
        </TableContainer>
    );
});

const styles = {
    toolbar: {
        display: "flex",
        justifyContent: "space-between",
        paddingLeft: "1em",
        margin: "0.5em 0 0.25em",
    },
    exportButton: {
        display: "flex",
        alignItems: "center",
        color: "#607d8b",
        position: "relative",
        justifyContent: "center",
    },
    exportStopButton: {
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        color: "#009688",
        position: "absolute",
        justifyContent: "center",
    },
    stop: { position: "absolute", fontSize: "14px" },
    bottomProgress: { height: "4px" },
} as const;

const StyledHeadTableRow = styled(TableRow)`
    background: #fff;
    & .MuiTableCell-root {
        border-bottom: unset;
    }
`;

const StyledTableRow = styled(StyledHeadTableRow)<{ binding: boolean }>`
    background: ${props => (props.binding ? "#dcedc8" : "#ffcdd2")};
    border: ${props => (props.binding ? "1px solid #9ccc65" : "1px solid #ef5350")};
`;

const StyledDialog = styled(Dialog)`
    .MuiDialogContent-root {
        padding: 0 !important;
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

const List = styled.ul`
    list-style: none;
    margin: 1.5rem 2rem;
    padding: 0;
    box-sizing: border-box;
`;

const Content = styled(Paper)`
    margin: 1.5rem 2rem;
`;
