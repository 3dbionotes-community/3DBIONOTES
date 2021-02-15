import React from "react";
import _ from "lodash";
import { ProtvistaViewer } from "../protvista/ProtvistaViewer";
import { PPIViewer } from "../ppi/PPIViewer";
import i18n from "../../utils/i18n";
import styles from "./Viewers.module.css";
import { JumpToButton } from "../protvista/JumpToButton";
import { BasicInfoViewer } from "../BasicInfoViewer";
import { ProfilesButton } from "../protvista/ProfilesButton";

export interface ViewersProps {}

export const Viewers: React.FC<ViewersProps> = () => {
    return (
        <React.Fragment>
            <div className={styles.section}>
                <div className={styles.actions}>
                    <button>{i18n.t("Tools")}</button>
                    <ProfilesButton />
                    <JumpToButton />
                </div>
            </div>

            <div>
                <BasicInfoViewer />
                <ProtvistaViewer />
                <PPIViewer />
            </div>
        </React.Fragment>
    );
};
