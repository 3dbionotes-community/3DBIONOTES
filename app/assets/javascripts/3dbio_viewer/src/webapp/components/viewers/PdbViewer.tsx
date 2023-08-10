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
import { PdbInfo } from "../../../domain/entities/PdbInfo";
import styles from "./Viewers.module.css";

export interface PdbViewerProps {
    pdb: Pdb;
    pdbInfo: PdbInfo;
    viewerState: ViewerState;
    onAddAnnotations(annotations: Annotations): void;
    toolbarExpanded: boolean;
}

export const PdbViewer: React.FC<PdbViewerProps> = React.memo(props => {
    const { pdb, viewerState, onAddAnnotations, pdbInfo, toolbarExpanded } = props;
    const { selection, profile, setProfile, setSelection } = viewerState;

    const blocks = React.useMemo(() => {
        return getVisibleBlocks(blockDefs, { pdb, profile }).filter(
            block => !debugFlags.showOnlyValidations || block.id === "mapValidation"
        );
    }, [pdb, profile]);

    return (
        <React.Fragment>
            <div className={styles["tools-section"]}>
                <ToolsButton onAddAnnotations={onAddAnnotations} expanded={toolbarExpanded} />
                <ProfilesButton
                    profile={profile}
                    onChange={setProfile}
                    expanded={toolbarExpanded}
                />
                <JumpToButton blocks={blocks} expanded={toolbarExpanded} />
                {!debugFlags.hideTraining && (
                    <TrainingApp locale="en" modules={modules} expanded={toolbarExpanded} />
                )}
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
