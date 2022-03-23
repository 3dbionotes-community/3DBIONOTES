import React from "react";
import { Dialog, DialogContent } from "@material-ui/core";
import i18n from "../../utils/i18n";
import "./Network.css";
import NetworkForm, { NetworkFormProps } from "./NetworkForm";
import { useGoto } from "../../hooks/use-goto";
import { DialogTitleHelp } from "../DialogTitleHelp";
import { TooltipTypography } from "../HtmlTooltip";

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
            <DialogTitleHelp
                title={i18n.t("Network")}
                onClose={onClose}
                tooltip={
                    <TooltipTypography variant="body2">
                        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Pariatur eaque
                        aspernatur, adipisci harum dolor neque dicta voluptas a asperiores sequi
                        atque quibusdam cumque. At excepturi nobis ea, tempora omnis eum
                    </TooltipTypography>
                }
            />
            <DialogContent>
                {i18n.t(
                    "In order to calculate Protein-protein interaction networks, please select the species and provide a list of protein identifiers."
                )}
                <NetworkForm onData={goToNetwork} />
            </DialogContent>
        </Dialog>
    );
});
