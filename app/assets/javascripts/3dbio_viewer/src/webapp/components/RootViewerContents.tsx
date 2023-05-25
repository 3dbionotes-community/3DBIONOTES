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
import { usePdbLoader } from "../hooks/use-pdb";
import { useBooleanState } from "../hooks/use-boolean";
import { Resizable, ResizeCallbackData } from "react-resizable";
import i18n from "../utils/i18n";
import "./resizable-styles.css";

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

    const [width, setWidth] = React.useState(0);

    const measuredWidth = React.useCallback((el: HTMLDivElement) => {
        if (el !== null) setWidth(el.getBoundingClientRect().width);
    }, []);

    const [widthStyle, setWidthStyle] = React.useState<{ width: string | number }>({
        width: `calc(55%)`,
    });

    // On top layout
    const onResize: (e: React.SyntheticEvent, data: ResizeCallbackData) => any = (
        event,
        { node, size, handle }
    ) => {
        setWidth(size.width);
        setWidthStyle({ width: size.width });
    };

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
            showLoading();
            setLoadingTitle(i18n.t("Loading PDB data..."));
        } else if (pdbLoader.type === "loaded") {
            hideLoading();
        }
    }, [pdbLoader.type, showLoading, hideLoading]);

    return (
        <div id="viewer">
            {!debugFlags.showOnlyValidations && (
                <>
                    <ViewerSelector
                        pdbInfo={pdbInfo}
                        selection={selection}
                        onSelectionChange={setSelection}
                        uploadData={uploadData}
                    />

                    <div id="left">
                        {error && <div style={{ color: "red" }}>{error}</div>}

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
                            setError={setError}
                        />
                    </div>
                </>
            )}

            <Resizable width={width} onResize={onResize} axis="x" resizeHandles={["w"]}>
                <div id="right" ref={measuredWidth} style={widthStyle}>
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
            </Resizable>
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
