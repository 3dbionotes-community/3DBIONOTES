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
import { BlockDef, BlockVisibility } from "../protvista/Protvista.types";
import styles from "./Viewers.module.css";

export interface PdbViewerProps {
    pdb: Pdb;
    pdbInfo: PdbInfo;
    viewerState: ViewerState;
    onAddAnnotations(annotations: Annotations): void;
}

export const PdbViewer: React.FC<PdbViewerProps> = React.memo(props => {
    const { pdb, viewerState, onAddAnnotations, pdbInfo } = props;
    const { selection, profile, setProfile } = viewerState;

    const [visibleBlocks, setVisibleBlocks] = React.useState<BlockVisibility[]>(
        blockDefs.map(blockDef => ({ block: blockDef, visible: true }))
    );

    const setBlockVisibility = React.useCallback(
        (block: BlockDef, visible: boolean) =>
            setVisibleBlocks(visibleBlocks =>
                visibleBlocks.map(i => (i.block.id === block.id ? { block, visible } : i))
            ),
        [setVisibleBlocks]
    );

    const blocks = React.useMemo(() => {
        return getVisibleBlocks(visibleBlocks, { pdb, profile }).filter(
            block => !debugFlags.showOnlyValidations || block.id === "mapValidation"
        );
    }, [pdb, profile, visibleBlocks]);

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
                setBlockVisibility={setBlockVisibility}
            />
        </React.Fragment>
    );
});
