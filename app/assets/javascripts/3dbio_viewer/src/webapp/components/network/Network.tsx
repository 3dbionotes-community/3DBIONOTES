import React from "react";
import { Dialog, DialogContent, DialogTitle, IconButton } from "@material-ui/core";
import { Close } from "@material-ui/icons";
import i18n from "../../utils/i18n";
import "./Network.css";
import NetworkForm, { NetworkFormProps } from "./NetworkForm";
import { useGoto } from "../../hooks/use-goto";

export interface NetworkProps {
    onClose(): void;
}

export const Network: React.FC<NetworkProps> = React.memo(props => {
    const { onClose } = props;
    const goTo = useGoto();

    const goToNetwork = React.useCallback<NetworkFormProps["onData"]>(
        options => {
            goTo(`/network/${options.token}`);
            onClose();
        },
        [goTo, onClose]
    );

    return (
        <Dialog open={true} onClose={onClose} maxWidth="lg">
            <DialogTitle>
                {i18n.t("Network")}
                <IconButton onClick={onClose}>
                    <Close />
                </IconButton>
            </DialogTitle>

            <DialogContent>
                {i18n.t(
                    "In order to calculate Protein-protein interaction networks, please select the species and provide a list of protein identifiers."
                )}
                <NetworkForm onData={goToNetwork} />
            </DialogContent>
        </Dialog>
    );
});
