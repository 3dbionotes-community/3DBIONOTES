import _ from "lodash";
import React from "react";
import { ResizableBox, ResizableBoxProps, ResizeCallbackData } from "react-resizable";
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
import i18n from "../utils/i18n";

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
    const [toolbarExpanded, { set: setToolbarExpanded }] = useBooleanState(true);
    const [viewerSelectorExpanded, { set: setViewerSelectorExpanded }] = useBooleanState(true);
    const { innerWidth, resizableBoxProps } = useResizableBox();

    const uploadData = getUploadData(externalData);

    const { pdbInfo, setLigands } = usePdbInfo(selection, uploadData);
    const [isLoading, { enable: showLoading, disable: hideLoading }] = useBooleanState(false);
    const [pdbLoader, setPdbLoader] = usePdbLoader(selection, pdbInfo);

    const uploadDataToken = selection.type === "uploadData" ? selection.token : undefined;
    const networkToken = selection.type === "network" ? selection.token : undefined;
    const proteinNetwork = externalData.type === "network" ? externalData.data : undefined;

    const toggleToolbarExpanded = React.useCallback(
        (_e: React.SyntheticEvent, data: ResizeCallbackData) => {
            setToolbarExpanded(data.size.width >= 520);
            setViewerSelectorExpanded(innerWidth - data.size.width >= 725);
        },
        [setToolbarExpanded, setViewerSelectorExpanded, innerWidth]
    );

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
                    <div id="left">
                        <ViewerSelector
                            pdbInfo={pdbInfo}
                            selection={selection}
                            onSelectionChange={setSelection}
                            uploadData={uploadData}
                            expanded={viewerSelectorExpanded}
                        />
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

            <ResizableBox
                width={resizableBoxProps.width ?? 0}
                minConstraints={resizableBoxProps.minConstraints}
                maxConstraints={resizableBoxProps.maxConstraints}
                axis="x"
                resizeHandles={resizableBoxProps.resizeHandles}
                onResize={toggleToolbarExpanded}
                onResizeStop={redrawWindow}
            >
                <div id="right">
                    <Viewers
                        viewerState={viewerState}
                        pdbInfo={pdbInfo}
                        uploadData={uploadData}
                        proteinNetwork={proteinNetwork}
                        pdbLoader={pdbLoader}
                        setPdbLoader={setPdbLoader}
                        toolbarExpanded={toolbarExpanded}
                    />
                </div>
            </ResizableBox>
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

function useResizableBox() {
    const [innerWidth, setInnerWidth] = React.useState(window.innerWidth);

    const resizableBoxProps = React.useMemo<
        Pick<ResizableBoxProps, "width" | "minConstraints" | "maxConstraints" | "resizeHandles">
    >(
        () => ({
            width: innerWidth * 0.55,
            minConstraints: [400, 0],
            maxConstraints: [innerWidth - 600, 0],
            resizeHandles: ["w"],
        }),
        [innerWidth]
    );

    React.useLayoutEffect(() => {
        setInnerWidth(window.innerWidth);
    }, []);

    return { innerWidth, resizableBoxProps };
}

function redrawWindow() {
    window.dispatchEvent(new Event("resize"));
}
