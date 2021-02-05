import React from "react";
import { ProtvistaViewer } from "../protvista/ProtvistaViewer";
import { PPIViewer } from "../ppi/PPIViewer";
import i18n from "../../utils/i18n";
import styles from "./Viewers.module.css";
import { JumpToButton, JumpToButtonProps } from "../protvista/JumpToButton";
import { GeneralInformationViewer } from "../GeneralInformationViewer";

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
                <GeneralInformationViewer />
                <ProtvistaViewer />
                <PPIViewer />
            </div>
        </React.Fragment>
    );
};
