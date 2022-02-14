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
import { addCustomAnnotationsToPdb, Pdb } from "../../../domain/entities/Pdb";
import { PdbInfo } from "../../../domain/entities/PdbInfo";
import { ViewerState } from "../../view-models/ViewerState";
import { UploadData } from "../../../domain/entities/UploadData";
import { Maybe } from "../../../utils/ts-utils";
import { Annotations } from "../../../domain/entities/Annotation";

export interface ViewersProps {
    viewerState: ViewerState;
    pdbInfo: Maybe<PdbInfo>;
    uploadData: Maybe<UploadData>;
}

export const Viewers: React.FC<ViewersProps> = React.memo(props => {
    const { viewerState, pdbInfo, uploadData } = props;
    const { selection } = viewerState;
    const [loader, setLoader] = usePdbLoader(selection, pdbInfo);

    const onAddAnnotations = React.useCallback(
        (annotations: Annotations) => {
            if (loader.type === "loaded") {
                const pdbUpdated = addCustomAnnotationsToPdb(loader.data, annotations);
                setLoader({ type: "loaded", data: pdbUpdated });
            }
        },
        [loader, setLoader]
    );

    return (
        <React.Fragment>
            <Loader state={loader} loadingMsg={i18n.t("Loading data...")} />

            {loader.type === "loaded" && (
                <PdbViewer
                    pdb={loader.data}
                    viewerState={viewerState}
                    uploadData={uploadData}
                    onAddAnnotations={onAddAnnotations}
                />
            )}
        </React.Fragment>
    );
});

export interface PdbViewerProps {
    pdb: Pdb;
    viewerState: ViewerState;
    uploadData: Maybe<UploadData>;
    onAddAnnotations(annotations: Annotations): void;
}

export const PdbViewer: React.FC<PdbViewerProps> = React.memo(props => {
    const { pdb, viewerState, uploadData, onAddAnnotations } = props;
    const { selection, profile, setProfile } = viewerState;

    const blocks = React.useMemo(() => {
        return getVisibleBlocks(blockDefs, { pdb, profile, uploadData });
    }, [pdb, profile, uploadData]);

    return (
        <React.Fragment>
            <div className={styles.section}>
                <div className={styles.actions}>
                    <ToolsButton onAddAnnotations={onAddAnnotations} />
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
