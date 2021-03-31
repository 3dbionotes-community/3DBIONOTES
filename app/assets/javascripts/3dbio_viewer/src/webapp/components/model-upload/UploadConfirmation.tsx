import React, { ReactText, useCallback, useState } from "react";
import _ from "lodash";
import { Dialog, DialogContent, DialogTitle, IconButton } from "@material-ui/core";
import { DataGrid } from "@material-ui/data-grid";
import { Close } from "@material-ui/icons";
import i18n from "../../utils/i18n";
import { UploadData, ChainObject } from "../../../domain/entities/UploadData";
import "./ModelUpload.css";

export interface UploadConfirmationProps {
    uploadData: UploadData;
    onClose(): void;
}

export const UploadConfirmation: React.FC<UploadConfirmationProps> = React.memo(props => {
    const { uploadData, onClose } = props;
    const [selectedRows, setSelectedRows] = useState<ReactText[]>([]);

    const columns = [
        { field: "id", headerName: i18n.t("ID"), width: 70 },
        { field: "chainName", headerName: i18n.t("Chain Name"), width: 132 },
        { field: "name", headerName: i18n.t("Title"), width: 150 },
        { field: "org", headerName: i18n.t("Organism"), width: 150 },
        { field: "acc", headerName: i18n.t("ACC"), width: 90 },
        { field: "cov", headerName: i18n.t("COV"), width: 85 },
        { field: "db", headerName: i18n.t("DB"), width: 80 },
        { field: "evalue", headerName: i18n.t("EValue"), width: 100 },
        { field: "start", headerName: i18n.t("Start Value"), width: 125 },
        { field: "end", headerName: i18n.t("End Value"), width: 120 },
      ];

    let chainId = 0;
    const rows =_.flatMap(Object.entries(uploadData.chains), ([key,value]) => {
      const mappedRows = value.map((entry : ChainObject) => {
        chainId++;
        return {
          id: chainId,
          chainName: key,
          name: entry.title.name.long,
          org: entry.title.org.long,
          ...entry
            };
      });
    return mappedRows;
  });
    const submitSelectedRows = useCallback(() => {
      const rowsToSend = _.flatMap(selectedRows, (selectedRow) => rows.filter(row => row.id === Number(selectedRow)));
    }, [rows, selectedRows]);

    return (
        <Dialog open={true} onClose={onClose} maxWidth="xl" fullWidth>
            <DialogTitle>
            {i18n.t("Upload Confirmation")}
                <IconButton onClick={onClose}>
                    <Close />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <p>
                {i18n.t("We need to identify the different proteins included in your structure. Please use the table below to select the corresponding protein for each chain included in your structure")}
                </p>
                <div style={{ height: 400, width: '100%' }}>
                <DataGrid rows={rows} columns={columns} pageSize={5} onSelectionModelChange={e => setSelectedRows(e.selectionModel)} checkboxSelection />
                </div>
                <button className="uploadSubmit" onClick={submitSelectedRows}>
                    {i18n.t("Submit")}
                </button>
            </DialogContent>
        </Dialog>
    );
});
