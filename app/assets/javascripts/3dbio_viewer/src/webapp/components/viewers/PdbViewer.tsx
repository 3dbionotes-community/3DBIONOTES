import React from "react";
import { ProtvistaViewer } from "../protvista/ProtvistaViewer";
import styles from "./Viewers.module.css";
import { JumpToButton } from "../protvista/JumpToButton";
import { ProfilesButton } from "../protvista/ProfilesButton";
import { ToolsButton } from "../protvista/ToolsButton";
import { blockDefs } from "../protvista/protvista-blocks";
import { Pdb } from "../../../domain/entities/Pdb";
import { ViewerState } from "../../view-models/ViewerState";
import { Annotations } from "../../../domain/entities/Annotation";
import { getVisibleBlocks } from "../protvista/Protvista.helpers";

export interface PdbViewerProps {
    pdb: Pdb;
    viewerState: ViewerState;
    onAddAnnotations(annotations: Annotations): void;
}

export const PdbViewer: React.FC<PdbViewerProps> = React.memo(props => {
    const { pdb, viewerState, onAddAnnotations } = props;
    const { selection, profile, setProfile } = viewerState;

    const blocks = React.useMemo(() => {
        return getVisibleBlocks(blockDefs, { pdb, profile }).filter(
            block => block.id === "mapValidation"
        );
    }, [pdb, profile]);

    return (
        <React.Fragment>
            <div className={styles.section}>
                <div className={styles.actions}>
                    <ToolsButton onAddAnnotations={onAddAnnotations} />
                    <ProfilesButton profile={profile} onChange={setProfile} />
                    <JumpToButton blocks={blocks} />
                </div>
            </div>

            <ProtvistaViewer blocks={blocks} pdb={pdb} selection={selection} />
        </React.Fragment>
    );
});
