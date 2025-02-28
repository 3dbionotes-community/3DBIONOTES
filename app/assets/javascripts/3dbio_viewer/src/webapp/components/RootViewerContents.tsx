import _ from "lodash";
import React from "react";
import styled from "styled-components";
import { Fab } from "@material-ui/core";
import { ResizableBox, ResizableBoxProps, ResizeCallbackData } from "react-resizable";
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
import { getMainItem } from "../view-models/Selection";
import i18n from "../utils/i18n";

export interface RootViewerContentsProps {
    viewerState: ViewerState;
}

type ExternalData =
    | { type: "none" }
    | { type: "uploadData"; data: UploadData }
    | { type: "network"; data: ProteinNetwork };

export type LoaderKey = keyof typeof loaderMessages;

//already ordered by priority
const loaderMessages = {
    readingSequence: [i18n.t("Reading sequence..."), 0],
    getRelatedPdbModel: [i18n.t("Getting PDB related model..."), 0],
    pdbLoader: [i18n.t("Loading PDB Data..."), 1],
    updateVisualPlugin: [i18n.t("Updating selection..."), 2],
    initPlugin: [i18n.t("Starting 3D Viewer..."), 3], //already loading PDB
    uploadedModel: [i18n.t("Loading uploaded model..."), 2],
    loadModel: [i18n.t("Loading model..."), 4], //PDB, EMDB, PDB-REDO, CSTF, CERES
    exportAnnotations: [i18n.t("Retrieving all annotations..."), 5],
} as const;

export const loaderKeys: {
    [P in LoaderKey]: LoaderKey;
} = _.mapValues(loaderMessages, (_v, k) => k as LoaderKey);

const loadersInitialState = _.mapValues(loaderMessages, ([message, priority]) => ({
    message,
    priority,
    status: "pending" as const,
}));

export const RootViewerContents: React.FC<RootViewerContentsProps> = React.memo(props => {
    const { viewerState } = props;
    const { selection, setSelection } = viewerState;
    const { compositionRoot } = useAppContext();

    const {
        loading,
        title,
        setLoader,
        updateLoaderStatus,
        updateOnResolve,
        loaders,
        resetLoaders,
    } = useMultipleLoaders<LoaderKey>(loadersInitialState);

    const [error, setError] = React.useState<string>();
    const [externalData, setExternalData] = React.useState<ExternalData>({ type: "none" });
    const [toolbarExpanded, { set: setToolbarExpanded }] = useBooleanState(true);
    const [viewerSelectorExpanded, { set: setViewerSelectorExpanded }] = useBooleanState(true);
    const { innerWidth, resizableBoxProps } = useResizableBox();
    const { scrolled: _scrolled, goToTop: _goToTop, ref } = useGoToTop<HTMLDivElement>();

    const uploadData = getUploadData(externalData);

    const onProcessDelay = React.useCallback(
        (reason: string) =>
            setLoader("pdbLoader", {
                status: "loading",
                message: i18n.t(
                    "Loading PDB Data...\n{{reason}}\nThis can take several minutes to load.",
                    { reason: reason }
                ),
                priority: 10,
            }),
        [setLoader]
    );

    const { pdbInfoLoader, setLigands } = usePdbInfo({ selection, uploadData, onProcessDelay });
    const [pdbLoader, setPdbLoader] = usePdbLoader(selection, pdbInfoLoader);

    const pdbInfo = React.useMemo(
        () => (pdbInfoLoader.type === "loaded" ? pdbInfoLoader.data : undefined),
        [pdbInfoLoader]
    );

    const uploadDataToken = selection.type === "uploadData" ? selection.token : undefined;
    const networkToken = selection.type === "network" ? selection.token : undefined;
    const proteinNetwork = externalData.type === "network" ? externalData.data : undefined;

    const proteinId = pdbLoader.type === "loaded" ? pdbLoader.data.protein?.id : undefined;

    const criticalLoaders = React.useMemo(
        () => [loaders.uploadedModel, loaders.initPlugin, loaders.getRelatedPdbModel],
        [loaders.uploadedModel, loaders.initPlugin, loaders.getRelatedPdbModel]
    );

    const toggleToolbarExpanded = React.useCallback(
        (_e: React.SyntheticEvent, data: ResizeCallbackData) => {
            setToolbarExpanded(data.size.width >= 475);
            setViewerSelectorExpanded(innerWidth - data.size.width >= 750);
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

    const pdbId = React.useMemo(() => getMainItem(selection, "pdb"), [selection]);
    const prevPdbId = React.useRef(pdbId);

    const chainId = selection.chainId;
    const prevChainId = React.useRef(chainId);
    const chains = React.useMemo(() => pdbInfo?.chains ?? [], [pdbInfo?.chains]);

    React.useEffect(() => {
        if (pdbId && pdbId !== prevPdbId.current) resetLoaders(loadersInitialState);
    }, [pdbId, prevPdbId, resetLoaders]);

    React.useEffect(() => {
        if (chainId && chainId !== prevChainId.current)
            setLoader("pdbLoader", loadersInitialState.pdbLoader);
    }, [chainId, pdbId, prevPdbId, resetLoaders, setLoader]);

    React.useEffect(() => {
        prevPdbId.current = pdbId;
    }, [pdbId]);

    React.useEffect(() => {
        prevChainId.current = chainId;
    }, [chainId]);

    React.useEffect(() => {
        const critical = criticalLoaders.find(loader => loader.status === "error");
        if (critical) setPdbLoader({ type: "error", message: critical.message });
    }, [criticalLoaders, setPdbLoader]);

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
                            chains={chains}
                            selection={selection}
                            onSelectionChange={setSelection}
                            onLigandsLoaded={setLigands}
                            proteinNetwork={proteinNetwork}
                            updateLoader={updateOnResolve}
                            loaderBusy={loading}
                            proteinId={proteinId}
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
                            updateLoader={updateOnResolve}
                        />
                    </div>
                </ResizableBox>
            </div>
            {/* {scrolled && (
                <StyledFab onClick={goToTop}>
                    <KeyboardArrowUpIcon fontSize="large" />
                </StyledFab>
            )} */}
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
            width: innerWidth * 0.5,
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

const _StyledFab = styled(Fab)`
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
