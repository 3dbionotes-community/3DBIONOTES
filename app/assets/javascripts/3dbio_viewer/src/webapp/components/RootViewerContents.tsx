import React from "react";
import _ from "lodash";
import { Viewers } from "./viewers/Viewers";
import { MolecularStructure } from "./molecular-structure/MolecularStructure";
import { ViewerSelector } from "./viewer-selector/ViewerSelector";
import { ViewerState } from "../view-models/ViewerState";
import { usePdbInfo } from "../hooks/loader-hooks";
import { useAppContext } from "./AppContext";
import { UploadData } from "../../domain/entities/UploadData";
import { setFromError } from "../utils/error";
import { ProteinNetwork } from "../../domain/entities/ProteinNetwork";

export interface RootViewerContentsProps {
    viewerState: ViewerState;
}

export const RootViewerContents: React.FC<RootViewerContentsProps> = React.memo(props => {
    const { viewerState } = props;
    const { compositionRoot } = useAppContext();
    const { selection, setSelection } = viewerState;
    const [uploadData, setUploadData] = React.useState<UploadData>();
    const [proteinNetwork, setProteinNetwork] = React.useState<ProteinNetwork>();
    const { pdbInfo, setLigands } = usePdbInfo(selection, uploadData, proteinNetwork);
    const [error, setError] = React.useState<string>();

    const uploadDataToken = selection.type === "uploadData" ? selection.token : undefined;
    const networkToken = selection.type === "network" ? selection.token : undefined;

    React.useEffect(() => {
        if (uploadDataToken) {
            return compositionRoot.getUploadData
                .execute(uploadDataToken)
                .run(setUploadData, err => setFromError(setError, err, `Cannot get data`));
        } else if (networkToken) {
            return compositionRoot.getNetwork
                .execute(networkToken)
                .run(setProteinNetwork, err => setFromError(setError, err, `Cannot get data`));
        } else {
            setUploadData(undefined);
        }
    }, [uploadDataToken, networkToken, compositionRoot]);

    return (
        <div id="viewer">
            {error && <div style={{ color: "red" }}></div>}

            <ViewerSelector
                pdbInfo={pdbInfo}
                selection={selection}
                onSelectionChange={setSelection}
                uploadData={uploadData || proteinNetwork?.uploadData}
            />

            <div id="left">
                <MolecularStructure
                    pdbInfo={pdbInfo}
                    selection={selection}
                    onSelectionChange={setSelection}
                    onLigandsLoaded={setLigands}
                />
            </div>

            <div id="right">
                {
                    <Viewers
                        viewerState={viewerState}
                        pdbInfo={pdbInfo}
                        uploadData={uploadData}
                        proteinNetwork={proteinNetwork}
                    />
                }
            </div>
        </div>
    );
});
