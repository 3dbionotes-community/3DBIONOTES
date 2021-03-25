import React from "react";
import _ from "lodash";
import { ProtvistaViewer } from "../protvista/ProtvistaViewer";
import i18n from "../../utils/i18n";
import styles from "./Viewers.module.css";
import { JumpToButton } from "../protvista/JumpToButton";
import { ProfilesButton } from "../protvista/ProfilesButton";
import { SelectionState } from "../../view-models/SelectionState";
import { Loader } from "../Loader";
import { usePdbLoader } from "../../hooks/use-pdb";
import { blockDefs } from "../protvista/protvista-blocks";

export interface ViewersProps {
    selection: SelectionState;
}

export const Viewers: React.FC<ViewersProps> = props => {
    const { selection } = props;
    const loader = usePdbLoader(selection);

    return (
        <React.Fragment>
            <div className={styles.section}>
                <div className={styles.actions}>
                    <button>{i18n.t("Tools")}</button>
                    <ProfilesButton />
                    <JumpToButton />
                </div>
            </div>

            <Loader state={loader} loadingMsg={i18n.t("Loading data...")} />

            {loader.type === "loaded" && (
                <React.Fragment>
                    <ProtvistaViewer blocks={blockDefs} pdb={loader.data} selection={selection} />
                </React.Fragment>
            )}
        </React.Fragment>
    );
};
