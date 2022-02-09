import React from "react";
import _ from "lodash";
import { ProtvistaViewer } from "../protvista/ProtvistaViewer";
import i18n from "../../utils/i18n";
import styles from "./Viewers.module.css";
import { JumpToButton } from "../protvista/JumpToButton";
import { ProfilesButton } from "../protvista/ProfilesButton";
import { ToolsButton } from "../protvista/ToolsButton";
import { Loader } from "../Loader";
import { usePdbLoader } from "../../hooks/use-pdb";
import { blockDefs } from "../protvista/protvista-blocks";
import { getVisibleBlocks } from "../protvista/Protvista.types";
import { Pdb } from "../../../domain/entities/Pdb";
import { PdbInfo } from "../../../domain/entities/PdbInfo";
import { ViewerState } from "../../view-models/ViewerState";
import { UploadData } from "../../../domain/entities/UploadData";
import { Maybe } from "../../../utils/ts-utils";

export interface ViewersProps {
    viewerState: ViewerState;
    pdbInfo: Maybe<PdbInfo>;
    uploadData: Maybe<UploadData>;
}

export const Viewers: React.FC<ViewersProps> = React.memo(props => {
    const { viewerState, pdbInfo, uploadData } = props;
    const { selection } = viewerState;
    const loader = usePdbLoader(selection, pdbInfo);
    if (!loader) return null;

    return (
        <React.Fragment>
            <Loader state={loader} loadingMsg={i18n.t("Loading data...")} />

            {loader.type === "loaded" && (
                <PdbViewer pdb={loader.data} viewerState={viewerState} uploadData={uploadData} />
            )}
        </React.Fragment>
    );
});

export interface PdbViewerProps {
    pdb: Pdb;
    viewerState: ViewerState;
    uploadData: Maybe<UploadData>;
}

export const PdbViewer: React.FC<PdbViewerProps> = React.memo(props => {
    const { pdb, viewerState, uploadData } = props;
    const { selection, profile, setProfile } = viewerState;

    const blocks = React.useMemo(() => {
        return getVisibleBlocks(blockDefs, { pdb, profile, uploadData });
    }, [pdb, profile, uploadData]);

    return (
        <React.Fragment>
            <div className={styles.section}>
                <div className={styles.actions}>
                    <ToolsButton />
                    <ProfilesButton profile={profile} onChange={setProfile} />
                    <JumpToButton blocks={blocks} />
                </div>
            </div>

            <ProtvistaViewer
                blocks={blocks}
                pdb={pdb}
                selection={selection}
                uploadData={uploadData}
            />
        </React.Fragment>
    );
});
