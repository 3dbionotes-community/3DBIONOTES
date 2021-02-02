import React from "react";
import { PPIViewer } from "../../components/ppi/PPIViewer";
import { Protvista } from "../../components/protvista/Protvista";
import i18n from "../../utils/i18n";
import styles from "../../components/protvista/Protvista.module.css";

interface ViewersProps {}

export const Viewers: React.FC<ViewersProps> = () => {
    return (
        <React.Fragment>
            <div className={styles.section}>
                <div className={styles.actions}>
                    <button>{i18n.t("Tools")}</button>
                    <button>{i18n.t("Profiles")}</button>
                    <button>{i18n.t("Jump to")}</button>
                </div>
            </div>

            <div>
                <Protvista />
                <PPIViewer />
            </div>
        </React.Fragment>
    );
};
