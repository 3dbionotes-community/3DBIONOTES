import _ from "lodash";
import React from "react";
import styled from "styled-components";
import { ResizableBox, ResizableBoxProps, ResizeCallbackData } from "react-resizable";
import { Fab, IconButton } from "@material-ui/core";
import { KeyboardArrowUp as KeyboardArrowUpIcon } from "@material-ui/icons";
import { Viewers } from "./viewers/Viewers";
import { MolecularStructure } from "./molecular-structure/MolecularStructure";
import { ViewerSelector } from "./viewer-selector/ViewerSelector";
import { ViewerState } from "../view-models/ViewerState";
import { useMultipleLoaders, usePdbInfo } from "../hooks/loader-hooks";
import { useAppContext } from "./AppContext";
import { UploadData } from "../../domain/entities/UploadData";
import { setFromError } from "../utils/error";
import { ProteinNetwork } from "../../domain/entities/ProteinNetwork";
import { debugFlags } from "../pages/app/debugFlags";
import { usePdbLoader } from "../hooks/use-pdb";
import { useBooleanState } from "../hooks/use-boolean";
import { LoaderMask } from "./loader-mask/LoaderMask";
import { isDev } from "../../routes";
import i18n from "../utils/i18n";

export interface RootViewerContentsProps {
    viewerState: ViewerState;
}

type ExternalData =
    | { type: "none" }
    | { type: "uploadData"; data: UploadData }
    | { type: "network"; data: ProteinNetwork };

const loaderMessages = {
    //already ordered by priority
    getRelatedPdbModel: [i18n.t("Getting PDB related model..."), 0],
    initPlugin: [i18n.t("Starting 3D Viewer..."), 1], //already loading PDB
    updateVisualPlugin: [i18n.t("Updating selection..."), 2],
    pdbLoader: [i18n.t("Loading PDB Data..."), 3],
    loadModel: [i18n.t("Loading model..."), 4], //PDB, EMDB, PDB-REDO, CSTF, CERES
} as const;

export type LoaderKey = keyof typeof loaderMessages;

export const RootViewerContents: React.FC<RootViewerContentsProps> = React.memo(props => {
    const { viewerState } = props;
    const { selection, setSelection } = viewerState;
    const { compositionRoot } = useAppContext();

    const {
        loading,
        title,
        updateLoaderStatus,
        updateOnResolve: updateLoader,
    } = useMultipleLoaders<LoaderKey>(
        _.mapValues(loaderMessages, ([message, priority]) => ({
            message,
            priority,
            status: "pending" as const,
        }))
    );

    const [error, setError] = React.useState<string>();
    const [externalData, setExternalData] = React.useState<ExternalData>({ type: "none" });
    const [toolbarExpanded, { set: setToolbarExpanded }] = useBooleanState(true);
    const [viewerSelectorExpanded, { set: setViewerSelectorExpanded }] = useBooleanState(true);
    const { innerWidth, resizableBoxProps } = useResizableBox();
    const { scrolled, goToTop, ref } = useGoToTop<HTMLDivElement>();

    const uploadData = getUploadData(externalData);
    const { pdbInfo, setLigands } = usePdbInfo(selection, uploadData);
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
        updateLoaderStatus("pdbLoader", pdbLoader.type);
    }, [pdbLoader.type, updateLoaderStatus]);

    return (
        <>
            <LoaderMask open={loading} title={title} />
            <div id="viewer" className={!isDev ? "prod" : undefined}>
                {!debugFlags.showOnlyValidations && (
                    <div id="left">
                        {error && <div style={{ color: "red" }}>{error}</div>}
                        <ViewerSelector
                            pdbInfo={pdbInfo}
                            selection={selection}
                            onSelectionChange={setSelection}
                            uploadData={uploadData}
                            expanded={viewerSelectorExpanded}
                        />
                        <MolecularStructure
                            pdbInfo={pdbInfo}
                            selection={selection}
                            onSelectionChange={setSelection}
                            onLigandsLoaded={setLigands}
                            proteinNetwork={proteinNetwork}
                            updateLoader={updateLoader}
                            loaderBusy={loading}
                        />
                    </div>
                )}

                <ResizableBox
                    axis="x"
                    onResize={toggleToolbarExpanded}
                    onResizeStop={redrawWindow}
                    {...resizableBoxProps}
                >
                    <div id="right" ref={ref}>
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
            {scrolled && (
                <StyledFab onClick={goToTop}>
                    <IconButton aria-label="delete">
                        <KeyboardArrowUpIcon fontSize="large" />
                    </IconButton>
                </StyledFab>
            )}
        </>
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
        Required<
            Pick<ResizableBoxProps, "width" | "minConstraints" | "maxConstraints" | "resizeHandles">
        >
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
        function updateInnerWidth() {
            setInnerWidth(window.innerWidth);
        }
        window.addEventListener("resize", updateInnerWidth);
        return () => window.removeEventListener("resize", updateInnerWidth);
    }, []);

    return { innerWidth, resizableBoxProps };
}

function useGoToTop<K extends HTMLElement>() {
    const [scrolled, setScrolled] = React.useState(false);
    const ref = React.useRef<K>(null);

    const goToTop = React.useCallback(() => {
        if (!ref.current) return;
        ref.current.scrollTop = 0;
    }, [ref]);

    const el = ref.current; //suggested by eslint
    React.useEffect(() => {
        if (!el) return;
        function scrollFunction() {
            if (ref.current) setScrolled(ref.current.scrollTop > 20);
        }
        if (el) {
            el.addEventListener("scroll", scrollFunction);
        }
        return () => {
            if (el) el.removeEventListener("scroll", scrollFunction);
        };
    }, [el]);

    return { scrolled, goToTop, ref };
}

function redrawWindow() {
    window.dispatchEvent(new Event("resize"));
}

const StyledFab = styled(Fab)`
    position: fixed;
    bottom: 2em;
    right: 2em;
    background-color: #123546;
    &:hover {
        background-color: #123546;
    }
    &.MuiFab-root .MuiSvgIcon-root {
        fill: #fff;
    }
`;
