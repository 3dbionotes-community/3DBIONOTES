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

    React.useEffect(() => {
        if (selection.main.type !== "uploaded") {
            setUploadData(undefined);
            return;
        }

        const { token } = selection.main;

        return compositionRoot.getUploadData.execute(token).run(setUploadData, err => {
            const msg = _.compact([`Cannot get data for token: ${token}`, err.message]).join(": ");
            setError(msg);
        });
    }, [selection, compositionRoot]);

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
