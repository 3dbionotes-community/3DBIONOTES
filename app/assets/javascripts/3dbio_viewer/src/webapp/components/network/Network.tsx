import React from "react";
import { Dialog, DialogContent, DialogTitle, IconButton } from "@material-ui/core";
import { Close } from "@material-ui/icons";
import i18n from "../../utils/i18n";
import "./Network.css";
import NetworkForm from "./NetworkForm";

export interface NetworkProps {
    onClose(): void;
}

export const Network: React.FC<NetworkProps> = React.memo(props => {
    const { onClose } = props;

    return (
        <Dialog open={true} onClose={onClose} maxWidth="xl" fullWidth>
            <DialogTitle>
                {i18n.t("Network")}
                <IconButton onClick={onClose}>
                    <Close />
                </IconButton>
            </DialogTitle>

            <DialogContent>
                <label>
                    {i18n.t(
                        "In order to calculate Protein-protein interaction networks, please select the species and provide a list of protein identifiers."
                    )}
                </label>
                <NetworkForm />
            </DialogContent>
        </Dialog>
    );
});
