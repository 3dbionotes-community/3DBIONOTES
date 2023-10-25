import _ from "lodash";
import React from "react";
import {
    Dialog,
    DialogTitle,
    Fab,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from "@material-ui/core";
import { NSPTarget } from "../../../domain/entities/Protein";
import { Close as CloseIcon, GetApp as GetAppIcon } from "@material-ui/icons";
import i18n from "../../utils/i18n";
import { Pdb } from "../../../domain/entities/Pdb";
import styled from "styled-components";

interface NMRDialogProps {
    pdb: Pdb;
    open: boolean;
    closeDialog: () => void;
}

export const NMRDialog: React.FC<NMRDialogProps> = React.memo(props => {
    const { pdb, open, closeDialog } = props;
    const [index, setIndex] = React.useState(0);

    const targets = React.useMemo(() => pdb.protein.nspTargets, [pdb.protein.nspTargets]);
    const title = React.useMemo(
        () => i18n.t("Ligand interaction NMR: {{target}}", { target: targets[index]?.name }),
        [targets, index]
    );

    return (
        <Dialog
            open={open}
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

            <DialogContent targets={targets} selectedIndex={index} />
            <StyledFab onClick={() => {}} variant="extended">
                <GetAppIcon style={{ marginRight: "0.5rem" }} />
                {i18n.t("Export")}
            </StyledFab>
        </Dialog>
    );
});

interface DialogContentProps {
    targets: NSPTarget[];
    selectedIndex: number;
}

const DialogContent: React.FC<DialogContentProps> = React.memo(({ targets, selectedIndex }) => {
    const target = React.useMemo(() => targets[selectedIndex], [targets, selectedIndex]);
    if (!target) return <></>;

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

const StyledFab = styled(Fab)`
    position: absolute;
    bottom: 2em;
    right: 3em;
    color: #fff;
    padding-right: 1.5em;
    background-color: #123546;
    &:hover {
        background-color: #123546;
    }
    &.MuiFab-root .MuiSvgIcon-root {
        fill: #fff;
    }
`;
