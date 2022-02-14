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
import { addCustomAnnotationsToPdb, Pdb } from "../../../domain/entities/Pdb";
import { PdbInfo } from "../../../domain/entities/PdbInfo";
import { ViewerState } from "../../view-models/ViewerState";
import { UploadData } from "../../../domain/entities/UploadData";
import { Maybe } from "../../../utils/ts-utils";
import { Annotations } from "../../../domain/entities/Annotation";
import { getVisibleBlocks } from "../protvista/Protvista.helpers";

export interface ViewersProps {
    viewerState: ViewerState;
    pdbInfo: Maybe<PdbInfo>;
    uploadData: Maybe<UploadData>;
}

export const Viewers: React.FC<ViewersProps> = React.memo(props => {
    const { viewerState, pdbInfo, uploadData } = props;
    const { selection } = viewerState;
    const [pdbLoader, setPdbLoader] = usePdbLoader(selection, pdbInfo);

    const onAddAnnotations = React.useCallback(
        (annotations: Annotations) => {
            setPdbLoader(pdbLoader => {
                if (pdbLoader.type === "loaded") {
                    const newPdb = addCustomAnnotationsToPdb(pdbLoader.data, annotations);
                    return { type: "loaded", data: newPdb };
                } else {
                    return pdbLoader;
                }
            });
        },
        [setPdbLoader]
    );

    // Add custom annotations from uploadData
    React.useEffect(() => {
        if (pdbLoader.type !== "loaded") return;

        setPdbLoader(pdbLoader => {
            if (pdbLoader.type === "loaded" && uploadData) {
                const newPdb = addCustomAnnotationsToPdb(pdbLoader.data, uploadData.annotations);
                return { type: "loaded", data: newPdb };
            } else {
                return pdbLoader;
            }
        });
    }, [uploadData, setPdbLoader, pdbLoader.type]);

    return (
        <React.Fragment>
            <Loader state={pdbLoader} loadingMsg={i18n.t("Loading data...")} />

            {pdbLoader.type === "loaded" && (
                <PdbViewer
                    pdb={pdbLoader.data}
                    viewerState={viewerState}
                    onAddAnnotations={onAddAnnotations}
                />
            )}
        </React.Fragment>
    );
});

export interface PdbViewerProps {
    pdb: Pdb;
    viewerState: ViewerState;
    onAddAnnotations(annotations: Annotations): void;
}

export const PdbViewer: React.FC<PdbViewerProps> = React.memo(props => {
    const { pdb, viewerState, onAddAnnotations } = props;
    const { selection, profile, setProfile } = viewerState;

    const blocks = React.useMemo(() => {
        return getVisibleBlocks(blockDefs, { pdb, profile });
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
