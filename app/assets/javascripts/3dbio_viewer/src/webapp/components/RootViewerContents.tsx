import React from "react";
import _ from "lodash";
import { Viewers } from "./viewers/Viewers";
import { MolecularStructure } from "./molecular-structure/MolecularStructure";
import { ViewerSelector } from "./viewer-selector/ViewerSelector";
import { ViewerState } from "../view-models/ViewerState";
import { usePdbInfo } from "../hooks/loader-hooks";
import { useAppContext } from "./AppContext";
import { UploadData } from "../../domain/entities/UploadData";

export interface RootViewerContentsProps {
    viewerState: ViewerState;
}

export const RootViewerContents: React.FC<RootViewerContentsProps> = React.memo(props => {
    const { viewerState } = props;
    const { compositionRoot } = useAppContext();
    const { selection, setSelection } = viewerState;
    const [uploadData, setUploadData] = React.useState<UploadData>();
    const { pdbInfo, setLigands } = usePdbInfo(selection, uploadData);
    const [error, setError] = React.useState<string>();
    const { token } = selection.main;

    React.useEffect(() => {
        if (!token) {
            setUploadData(undefined);
        } else {
            return compositionRoot.getUploadData.execute(token).run(setUploadData, err => {
                const msg = _.compact([`Cannot get data token: ${token}`, err.message]).join(": ");
                setError(msg);
            });
        }
    }, [token, compositionRoot]);

    return (
        <div id="viewer">
            {error && <div style={{ color: "red" }}></div>}

            <ViewerSelector
                pdbInfo={pdbInfo}
                selection={selection}
                onSelectionChange={setSelection}
                uploadData={uploadData}
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
                {<Viewers viewerState={viewerState} pdbInfo={pdbInfo} uploadData={uploadData} />}
            </div>
        </div>
    );
});
