import React from "react";
import _ from "lodash";
import { ProtvistaViewer } from "../protvista/ProtvistaViewer";
import i18n from "../../utils/i18n";
import styles from "./Viewers.module.css";
import { JumpToButton } from "../protvista/JumpToButton";
import { ProfilesButton } from "../protvista/ProfilesButton";
import { ToolsButton } from "../protvista/ToolsButton";
import { SelectionState } from "../../view-models/SelectionState";
import { Loader } from "../Loader";
import { usePdbLoader } from "../../hooks/use-pdb";
import { blockDefs, Profile, profiles } from "../protvista/protvista-blocks";
import { getVisibleBlocks } from "../protvista/Protvista.types";
import { Pdb } from "../../../domain/entities/Pdb";

export interface ViewersProps {
    selection: SelectionState;
}

export const Viewers: React.FC<ViewersProps> = React.memo(props => {
    const { selection } = props;
    const loader = usePdbLoader(selection);

    return (
        <React.Fragment>
            <Loader state={loader} loadingMsg={i18n.t("Loading data...")} />

            {loader.type === "loaded" && <PdbViewer pdb={loader.data} selection={selection} />}
        </React.Fragment>
    );
});

export interface PdbViewerProps {
    pdb: Pdb;
    selection: SelectionState;
}

export const PdbViewer: React.FC<PdbViewerProps> = React.memo(props => {
    const { pdb, selection } = props;
    const [profile, setProfile] = React.useState<Profile>(profiles.general);

    const blocks = React.useMemo(() => {
        return getVisibleBlocks(blockDefs, { pdb, profile });
    }, [pdb, profile]);

    return (
        <React.Fragment>
            <div className={styles.section}>
                <div className={styles.actions}>
                    <ToolsButton />
                    <ProfilesButton profile={profile} onChange={setProfile} />
                    <JumpToButton blocks={blocks} />
                </div>
            </div>

            <ProtvistaViewer blocks={blocks} pdb={pdb} selection={selection} />
        </React.Fragment>
    );
});
