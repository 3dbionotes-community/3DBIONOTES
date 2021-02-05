import React from "react";
import { PPIViewer } from "../../components/ppi/PPIViewer";
import { Protvista } from "../../components/protvista/Protvista";
import i18n from "../../utils/i18n";
import styles from "../../components/protvista/Protvista.module.css";
import { JumpToButton, JumpToButtonProps } from "../../components/protvista/JumpToButton";
import { ProfilesButton, ProfilesButtonProps } from "../../components/protvista/ProfilesButton";

interface ViewersProps {}

export const Viewers: React.FC<ViewersProps> = () => {
    const blocksItems: JumpToButtonProps["items"] = [
        { text: i18n.t("Structural information"), id: "structural-info" },
        { text: i18n.t("Map validation"), id: "map-validation" },
        { text: i18n.t("PPI viewer"), id: "ppi" },
    ];

    const profileItems: ProfilesButtonProps["items"] = [
        { text: i18n.t("General"), id: "general" },
        { text: i18n.t("Structural"), id: "structural" },
        { text: i18n.t("Validation (em-computational models)"), id: "validation" },
        { text: i18n.t("Drug Design - Experimental"), id: "drug-design" },
        { text: i18n.t("Omics"), id: "omics" },
        { text: i18n.t("Biomedicine"), id: "biomedicine" },
    ];

    return (
        <React.Fragment>
            <div className={styles.section}>
                <div className={styles.actions}>
                    <button>{i18n.t("Tools")}</button>
                    <ProfilesButton items={profileItems} />
                    <JumpToButton items={blocksItems} />
                </div>
            </div>

            <div>
                <Protvista />
                <PPIViewer />
            </div>
        </React.Fragment>
    );
};
