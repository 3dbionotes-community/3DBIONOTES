import React from "react";
import _ from "lodash";
import { ProtvistaViewer } from "../protvista/ProtvistaViewer";
import { PPIViewer } from "../ppi/PPIViewer";
import i18n from "../../utils/i18n";
import styles from "./Viewers.module.css";
import { JumpToButton, JumpToButtonProps } from "../protvista/JumpToButton";
import { BasicInfoViewer } from "../BasicInfoViewer";
import { ProfilesButton, ProfilesButtonProps } from "../protvista/ProfilesButton";

interface ViewersProps {}

export const blocks = {
    generalInfo: { text: i18n.t("General information") },
    structuralInfo: { text: i18n.t("Structural information") },
    mapValidation: { text: i18n.t("Map validation") },
    ppiViewer: { text: i18n.t("PPI viewer") },
};

export const Viewers: React.FC<ViewersProps> = () => {
    const jumpToItems: JumpToButtonProps["items"] = React.useMemo(() => {
        return _.map(blocks, (attrs, id) => ({ id, ...attrs }));
    }, []);

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
                    <JumpToButton items={jumpToItems} />
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
