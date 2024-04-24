import _ from "lodash";
import React from "react";
import styled from "styled-components";
import {
    Button,
    CircularProgress,
    Dialog,
    DialogTitle,
    IconButton,
    LinearProgress,
    Paper,
    Portal,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Typography,
} from "@material-ui/core";
import { BasicNMRFragmentTarget, NMRFragmentTarget } from "../../../domain/entities/Protein";
import { Close as CloseIcon, GetApp as GetAppIcon, Stop as StopIcon } from "@material-ui/icons";
import { useAppContext } from "../AppContext";
import { useBooleanState } from "../../hooks/use-boolean";
import { LoaderMask } from "../loader-mask/LoaderMask";
import { Cancel } from "../../../utils/future";
import { NMRPagination } from "../../../domain/repositories/NMRRepository";
import { getSource } from "../../../domain/entities/Source";
import { NonBulletListItem as ListItem } from "../idr/IDRViewerBlock";
import i18n from "../../utils/i18n";

interface NMRDialogProps {
    basicTarget: BasicNMRFragmentTarget;
    open: boolean;
    closeDialog: () => void;
}

export const NMRDialog: React.FC<NMRDialogProps> = React.memo(props => {
    const { basicTarget, open, closeDialog } = props;
    const {
        getNMR,
        target,
        saveTarget,
        pagination: [pagination, setPagination],
        nmrSource,
    } = useNMR(basicTarget);
    const [isSaving, savingActions] = useBooleanState();
    const [isLoading, loadingActions] = useBooleanState();

    const nmrMethod = nmrSource?.methods[0];

    const save = React.useCallback(
        () => saveTarget({ show: savingActions.open, hide: savingActions.close }),
        [saveTarget, savingActions]
    );

    const title = React.useMemo(
        () => `${i18n.t("NMR-based fragment screening on")}: ${target?.name ?? ""}`,
        [target]
    );

    React.useEffect(() => {
        getNMR({ show: loadingActions.open, hide: loadingActions.close });
    }, [getNMR, loadingActions]);

    const nmrReference = nmrMethod && (
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

    const fragmentsList = target ? (
        <Content elevation={3}>
            {isLoading && pagination.pageSize >= 25 && <StyledLinearProgress />}
            <DialogContent target={target} pagination={pagination} />
            <Toolbar
                pagination={pagination}
                setPagination={setPagination}
                save={save}
                isSaving={isSaving}
                hideSaving={savingActions.close}
            />
            <div style={styles.bottomProgress}>{isLoading && <StyledLinearProgress />}</div>
        </Content>
    ) : (
        <Typography>{i18n.t("Unable to retrieve NMR")}</Typography>
    );

    return (
        <>
            <Dialog
                open={Boolean(open && target)}
                onClose={closeDialog}
                maxWidth="xl"
                fullWidth
                className="model-search"
                scroll="paper"
            >
                <DialogTitle>
                    {title}
                    <IconButton onClick={closeDialog}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                {nmrReference}
                {fragmentsList}
            </Dialog>
            <Portal>
                <LoaderMask
                    open={isLoading && pagination.count === 0}
                    title={i18n.t("Loading NMR...")}
                />
            </Portal>
        </>
    );
});

interface ToolbarProps {
    pagination: NMRPagination;
    setPagination: SetNMRPagination;
    save: () => Cancel | undefined;
    hideSaving: () => void;
    isSaving: boolean;
}

const Toolbar: React.FC<ToolbarProps> = React.memo(props => {
    const {
        pagination,
        setPagination: { setPage, setPageSize },
        isSaving,
        save,
        hideSaving,
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
        if (isSaving) return;
        const cancel = save();
        setSaving(_saving => cancel);
    }, [isSaving, save]);

    const stopSaving = React.useCallback(() => {
        if (saving) {
            saving();
            hideSaving();
        }
    }, [saving, hideSaving]);

    return (
        <div style={styles.toolbar}>
            <ExportButton isProcessing={isSaving} onClick={onClick} stop={stopSaving} />
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
            startIcon={<GetAppIcon />}
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

interface DialogContentProps {
    target: NMRFragmentTarget;
    pagination: NMRPagination;
}

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

function useNMR(basicTarget: BasicNMRFragmentTarget) {
    const [page, setPage] = React.useState(0);
    const [pageSize, setPageSize] = React.useState(25);
    const [count, setCount] = React.useState(0);
    const { compositionRoot, sources } = useAppContext();
    const [target, setTarget] = React.useState<NMRFragmentTarget>();

    React.useEffect(() => {
        setCount(0);
    }, [basicTarget]);

    const getNMR = React.useCallback(
        (loading: { show: () => void; hide: () => void }) => {
            loading.show();
            return compositionRoot.getPartialNMR
                .execute(basicTarget, { page, pageSize, count })
                .run(
                    ({ target, pagination }) => {
                        setCount(pagination.count);
                        setTarget(target);
                        loading.hide();
                    },
                    err => {
                        console.error(err);
                        loading.hide();
                    }
                );
        },
        [compositionRoot, count, pageSize, page, basicTarget]
    );

    const saveTarget = React.useCallback(
        (loading: { show: () => void; hide: () => void }) => {
            loading.show();
            return compositionRoot.saveNMR.execute(basicTarget).run(
                () => {
                    loading.hide();
                },
                err => {
                    console.error(err);
                    loading.hide();
                }
            );
        },
        [compositionRoot, basicTarget]
    );

    return {
        getNMR,
        target,
        saveTarget,
        pagination: [
            { page, pageSize, count } as NMRPagination,
            { setPage, setPageSize, setCount } as SetNMRPagination,
        ] as const,
        nmrSource: getSource(sources, "NMR"),
    };
}

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

interface SetNMRPagination {
    setPage: React.Dispatch<React.SetStateAction<number>>;
    setPageSize: React.Dispatch<React.SetStateAction<number>>;
    setCount: React.Dispatch<React.SetStateAction<number>>;
}

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
    margin: 1.5rem 2rem 0;
    padding: 0;
    box-sizing: border-box;
`;

const Content = styled(Paper)`
    margin: 1.5rem 2rem;
`;
