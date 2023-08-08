import React from "react";
import { ProtvistaViewer } from "../protvista/ProtvistaViewer";
import { JumpToButton } from "../protvista/JumpToButton";
import { ProfilesButton } from "../protvista/ProfilesButton";
import { ToolsButton } from "../protvista/ToolsButton";
import { blockDefs } from "../protvista/protvista-blocks";
import { Pdb } from "../../../domain/entities/Pdb";
import { ViewerState } from "../../view-models/ViewerState";
import { Annotations } from "../../../domain/entities/Annotation";
import { getVisibleBlocks } from "../protvista/Protvista.helpers";
import { debugFlags } from "../../pages/app/debugFlags";
import { TrainingApp } from "../../training-app";
import { modules } from "../../training-app/training-modules";
import styles from "./Viewers.module.css";
import { PdbInfo } from "../../../domain/entities/PdbInfo";

export interface PdbViewerProps {
    pdb: Pdb;
    pdbInfo: PdbInfo;
    viewerState: ViewerState;
    onAddAnnotations(annotations: Annotations): void;
}

export const PdbViewer: React.FC<PdbViewerProps> = React.memo(props => {
    const { pdb, viewerState, onAddAnnotations, pdbInfo } = props;
    const { selection, profile, setProfile, setSelection } = viewerState;

    const blocks = React.useMemo(() => {
        return getVisibleBlocks(blockDefs, { pdb, profile }).filter(
            block => !debugFlags.showOnlyValidations || block.id === "mapValidation"
        );
    }, [pdb, profile]);

    return (
        <React.Fragment>
            <div className={styles["tools-section"]}>
                <ToolsButton onAddAnnotations={onAddAnnotations} />
                <ProfilesButton profile={profile} onChange={setProfile} />
                <JumpToButton blocks={blocks} />
                {!debugFlags.hideTraining && <TrainingApp locale="en" modules={modules} />}
            </div>
            <ProtvistaViewer
                pdbInfo={pdbInfo}
                blocks={blocks}
                pdb={pdb}
                selection={selection}
                setSelection={setSelection}
            />
        </React.Fragment>
    );
});
