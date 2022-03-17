import React from "react";
import _ from "lodash";
import { Dialog, DialogContent, DialogTitle, IconButton } from "@material-ui/core";
import { Close } from "@material-ui/icons";
import { DataGrid, DataGridProps } from "@material-ui/data-grid";

import i18n from "../../utils/i18n";
import { AtomicStructure, ChainObject } from "../../../domain/entities/AtomicStructure";
import { useAppContext } from "../AppContext";
import { useCallbackEffect } from "../../hooks/use-callback-effect";
import "./ModelUpload.css";

export interface UploadConfirmationProps {
    atomicStructure: AtomicStructure;
    onClose(): void;
    onLoaded(options: { token: string }): void;
}

type ObjectId = string;

interface Column {
    field: keyof ChainObject;
    headerName: string;
    width: number;
}

export const StructureMappingUpload: React.FC<UploadConfirmationProps> = React.memo(props => {
    const { atomicStructure, onClose, onLoaded } = props;
    const { compositionRoot } = useAppContext();
    const [selectedIds, setSelectedIds] = React.useState<ObjectId[]>([]);

    const columns: Column[] = [
        { field: "chain", headerName: i18n.t("Chain"), width: 70 },
        { field: "name", headerName: i18n.t("Title"), width: 240 },
        { field: "org", headerName: i18n.t("Organism"), width: 240 },
        { field: "acc", headerName: i18n.t("ACC"), width: 90 },
        { field: "cov", headerName: i18n.t("COV"), width: 85 },
        { field: "db", headerName: i18n.t("DB"), width: 80 },
        { field: "evalue", headerName: i18n.t("EValue"), width: 100 },
        { field: "start", headerName: i18n.t("Start Value"), width: 110 },
        { field: "end", headerName: i18n.t("End Value"), width: 110 },
    ];

    const rows = React.useMemo(() => {
        return _(atomicStructure.tracks)
            .toPairs()
            .sortBy(([chainId, _objs]) => chainId)
            .flatMap(([_chainId, objs]) => objs)
            .value();
    }, [atomicStructure.tracks]);

    const setSelectedRowsUniqueChain = useUniqueChainSelection(rows, selectedIds, setSelectedIds);

    const [error, setError] = React.useState<string>();

    const submitSelectedRows = useCallbackEffect(
        React.useCallback(() => {
            const chainObjects = _.flatMap(selectedIds, selectedRow =>
                rows.filter(row => row.id === String(selectedRow))
            );

            if (_(chainObjects).isEmpty()) {
                setError(i18n.t("Select at least one chain"));
                return;
            }

            return compositionRoot.uploadAtomicStructureMapping
                .execute(atomicStructure, chainObjects)
                .run(
                    res => onLoaded(res),
                    err => setError(err.message)
                );
        }, [compositionRoot, rows, selectedIds, atomicStructure, onLoaded])
    );

    return (
        <Dialog open={true} onClose={onClose} maxWidth="xl" fullWidth>
            <DialogTitle>
                {i18n.t("Upload Confirmation")}
                <IconButton onClick={onClose}>
                    <Close />
                </IconButton>
            </DialogTitle>

            <DialogContent style={{ height: "90vh" }}>
                <p>
                    {i18n.t(
                        "We need to identify the different proteins included in your structure. Please use the table below to select the corresponding protein for each chain included in your structure"
                    )}
                </p>
                <div style={{ height: "80%", width: "100%" }}>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        disableColumnMenu={true}
                        pageSize={6}
                        onSelectionModelChange={setSelectedRowsUniqueChain}
                        selectionModel={selectedIds}
                        checkboxSelection
                    />
                </div>

                {error && <div style={{ color: "red" }}>{error}</div>}

                <button className="uploadSubmit" onClick={submitSelectedRows}>
                    {i18n.t("Submit")}
                </button>
            </DialogContent>
        </Dialog>
    );
});

function useUniqueChainSelection(
    rows: ChainObject[],
    selectedIds: ObjectId[],
    setSelectedIds: React.Dispatch<React.SetStateAction<ObjectId[]>>
) {
    const rowsById = React.useMemo(() => _.keyBy(rows, row => row.id), [rows]);

    const setSelectedRowsWithUniqueChain = React.useCallback<
        NonNullable<DataGridProps["onSelectionModelChange"]>
    >(
        param => {
            // Keep last selected for a chain
            const ids = param;
            const prevIds = _.intersection(selectedIds, ids);
            const newIds = _.difference(ids, prevIds);
            const newSelectedIds = _(newIds)
                .concat(prevIds)
                .map(id => rowsById[id])
                .compact()
                .uniqBy(obj => obj.chain)
                .map(obj => obj.id)
                .value();

            setSelectedIds(newSelectedIds);
        },
        [setSelectedIds, selectedIds, rowsById]
    );

    return setSelectedRowsWithUniqueChain;
}
