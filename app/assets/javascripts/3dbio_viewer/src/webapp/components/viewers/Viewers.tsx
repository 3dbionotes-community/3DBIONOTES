import React from "react";
import _ from "lodash";
import { ProtvistaViewer } from "../protvista/ProtvistaViewer";
import { PPIViewer } from "../ppi/PPIViewer";
import i18n from "../../utils/i18n";
import styles from "./Viewers.module.css";
import { JumpToButton, JumpToButtonProps } from "../protvista/JumpToButton";
import { BasicInfoViewer } from "../BasicInfoViewer";

interface ViewersProps {}

export const blocks = {
    generalInfo: { text: i18n.t("General information") },
    structuralInfo: { text: i18n.t("Structural information") },
    mapValidation: { text: i18n.t("Map validation") },
    ppiViewer: { text: i18n.t("PPI viewer") },
};

export const Viewers: React.FC<ViewersProps> = () => {
    const items: JumpToButtonProps["items"] = React.useMemo(() => {
        return _.map(blocks, (attrs, id) => ({ id, ...attrs }));
    }, []);

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
                <BasicInfoViewer />
                <ProtvistaViewer />
                <PPIViewer />
            </div>
        </React.Fragment>
    );
};
