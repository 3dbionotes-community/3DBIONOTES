import React from "react";
import { Dialog, DialogContent, IconButton } from "@material-ui/core";
import { Close, HelpOutline as HelpOutlineIcon } from "@material-ui/icons";
import i18n from "../../utils/i18n";
import "./Network.css";
import NetworkForm, { NetworkFormProps } from "./NetworkForm";
import { useGoto } from "../../hooks/use-goto";
import { HtmlTooltip, StyledTypography, styles } from "../HtmlTooltip";
import { StyledDialogTitle } from "../annotations-tool/AnnotationsTool";

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
            <StyledDialogTitle>
                {i18n.t("Network")}
                <HtmlTooltip
                    title={
                        <StyledTypography variant="body2">
                            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Pariatur eaque
                            aspernatur, adipisci harum dolor neque dicta voluptas a asperiores sequi
                            atque quibusdam cumque. At excepturi nobis ea, tempora omnis eum
                        </StyledTypography>
                    }
                >
                    <span style={styles.tooltip}>
                        <HelpOutlineIcon />
                    </span>
                </HtmlTooltip>
                <IconButton onClick={onClose}>
                    <Close />
                </IconButton>
            </StyledDialogTitle>

            <DialogContent>
                {i18n.t(
                    "In order to calculate Protein-protein interaction networks, please select the species and provide a list of protein identifiers."
                )}
                <NetworkForm onData={goToNetwork} />
            </DialogContent>
        </Dialog>
    );
});
