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
import { debugFlags } from "../pages/app/debugFlags";
import i18n from "../utils/i18n";
import { usePdbLoader } from "../hooks/use-pdb";
import { useBooleanState } from "../hooks/use-boolean";

export interface RootViewerContentsProps {
    viewerState: ViewerState;
}

type ExternalData =
    | { type: "none" }
    | { type: "uploadData"; data: UploadData }
    | { type: "network"; data: ProteinNetwork };

export const RootViewerContents: React.FC<RootViewerContentsProps> = React.memo(props => {
    const { viewerState } = props;
    const { compositionRoot } = useAppContext();
    const { selection, setSelection } = viewerState;
    const [error, setError] = React.useState<string>();
    const [loadingTitle, setLoadingTitle] = React.useState(i18n.t("Loading"));
    const [externalData, setExternalData] = React.useState<ExternalData>({ type: "none" });

    const uploadData = getUploadData(externalData);

    const { pdbInfo, setLigands } = usePdbInfo(selection, uploadData);
    const [isLoading, { enable: showLoading, disable: hideLoading }] = useBooleanState(false);
    const [pdbLoader, setPdbLoader] = usePdbLoader(selection, pdbInfo);

    const uploadDataToken = selection.type === "uploadData" ? selection.token : undefined;
    const networkToken = selection.type === "network" ? selection.token : undefined;
    const proteinNetwork = externalData.type === "network" ? externalData.data : undefined;

    React.useEffect(() => {
        if (uploadDataToken) {
            return compositionRoot.getUploadData.execute(uploadDataToken).run(
                data => setExternalData({ type: "uploadData", data }),
                err => setFromError(setError, err, `Cannot get upload data`)
            );
        } else if (networkToken) {
            return compositionRoot.getNetwork.execute(networkToken).run(
                data => setExternalData({ type: "network", data }),
                err => setFromError(setError, err, `Cannot get network data`)
            );
        } else {
            setExternalData({ type: "none" });
        }
    }, [uploadDataToken, networkToken, compositionRoot]);

    React.useEffect(() => {
        if (pdbLoader.type === "loading") {
            setLoadingTitle(i18n.t("Loading PDB data..."));
            showLoading();
        } else {
            hideLoading();
        }
    }, [pdbLoader.type]);

    return (
        <div id="viewer">
            {error && <div style={{ color: "red" }}></div>}

            {!debugFlags.showOnlyValidations && (
                <>
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
                            proteinNetwork={proteinNetwork}
                            title={loadingTitle}
                            setTitle={setLoadingTitle}
                            isLoading={isLoading}
                            showLoading={showLoading}
                            hideLoading={hideLoading}
                        />
                    </div>
                </>
            )}

            <div id="right">
                {
                    <Viewers
                        viewerState={viewerState}
                        pdbInfo={pdbInfo}
                        uploadData={uploadData}
                        proteinNetwork={proteinNetwork}
                        pdbLoader={pdbLoader}
                        setPdbLoader={setPdbLoader}
                    />
                }
            </div>
        </div>
    );
});

function getUploadData(externalData: ExternalData) {
    return externalData.type === "uploadData"
        ? externalData.data
        : externalData.type === "network"
        ? externalData.data.uploadData
        : undefined;
}
