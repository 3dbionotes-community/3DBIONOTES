import React from "react";
import { PPIViewer } from "../../components/ppi/PPIViewer";
import { Protvista } from "../../components/protvista/Protvista";
import i18n from "../../utils/i18n";
import styles from "../../components/protvista/Protvista.module.css";
import { JumpToButton, JumpToButtonProps } from "../../components/protvista/JumpToButton";

interface ViewersProps {}

export const Viewers: React.FC<ViewersProps> = () => {
    const items: JumpToButtonProps["items"] = [
        { text: i18n.t("Structural information"), id: "structural-info" },
        { text: i18n.t("Map validation"), id: "map-validation" },
        { text: i18n.t("PPI viewer"), id: "ppi" },
    ];

    return (
        <React.Fragment>
            <div className={styles.section}>
                <div className={styles.actions}>
                    <button>{i18n.t("Tools")}</button>
                    <button>{i18n.t("Profiles")}</button>
                    <JumpToButton items={items} />
                </div>
            </div>

            <div>
                <Protvista />
                <PPIViewer />
            </div>
        </React.Fragment>
    );
};
