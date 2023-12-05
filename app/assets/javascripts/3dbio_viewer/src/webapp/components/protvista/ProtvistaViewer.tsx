import _ from "lodash";
import React from "react";
import { Pdb, getEntityLinks } from "../../../domain/entities/Pdb";
import { Selection } from "../../view-models/Selection";
import { BlockProps, ViewerBlock } from "../ViewerBlock";
import { ProtvistaPdb } from "./ProtvistaPdb";
import { BlockComponentProps, BlockDef, TrackComponentProps } from "./Protvista.types";
import { PPIViewer } from "../ppi/PPIViewer";
import { GeneViewer } from "../gene-viewer/GeneViewer";
import { PdbInfo } from "../../../domain/entities/PdbInfo";
import { getSelectedChain } from "../viewer-selector/ViewerSelector";
import { useAppContext } from "../AppContext";
import { ProtvistaAction, getBlockTracks } from "./Protvista.helpers";
import { NMRDialog } from "../nmr/NMRDialog";
import { useBooleanState } from "../../hooks/use-boolean";
import i18n from "../../utils/i18n";
import "./protvista-pdb.css";
import "./ProtvistaViewer.css";
import { BasicNMRFragmentTarget } from "../../../domain/entities/Protein";

export interface ProtvistaViewerProps {
    pdb: Pdb;
    pdbInfo: PdbInfo;
    selection: Selection;
    blocks: BlockDef[];
    setSelection: (newSelection: Selection) => void;
    setBlockVisibility: (block: BlockDef, visible: boolean) => void;
}

const trackComponentMapping: Partial<Record<string, React.FC<TrackComponentProps>>> = {
    "ppi-viewer": PPIViewer,
    "gene-viewer": GeneViewer,
};

export const ProtvistaViewer: React.FC<ProtvistaViewerProps> = props => {
    const { pdb, selection, blocks, pdbInfo, setBlockVisibility, setSelection } = props;

    const [nmrTarget, setNMRTarget] = React.useState<BasicNMRFragmentTarget>();
    const [openNMRDialog, { enable: showNMRDialog, disable: closeNMRDialog }] = useBooleanState(
        false
    );

    const setBlockVisible = React.useCallback(
        (block: BlockDef) => (visible: boolean) => setBlockVisibility(block, visible),
        [setBlockVisibility]
    );

    const selectedChain = React.useMemo(
        () => getSelectedChain(pdbInfo?.chains, selection.chainId),
        [pdbInfo, selection]
    );

    const ligandsAndSmallMoleculesCount = React.useMemo(
        () =>
            pdbInfo?.ligands.filter(ligand => ligand.shortChainId === selectedChain?.chainId)
                .length,
        [selectedChain, pdbInfo]
    );

    const geneName = React.useMemo(
        () =>
            pdb.protein.gen
                ? i18n.t(" encoded by the gene {{geneName}}", { geneName: pdb.protein.gen })
                : undefined,
        [pdb.protein]
    );

    const geneBankEntry = React.useMemo(
        () =>
            !_.isEmpty(pdb.protein.genBank)
                ? i18n.t(" (GeneBank {{geneBankEntry}})", {
                      geneBankEntry: pdb.protein.genBank?.join(", "),
                  })
                : undefined,
        [pdb.protein]
    );

    const namespace = React.useMemo(
        () => ({
            poorQualityRegionMax: _.first(pdb.emdbs)?.emv?.stats?.quartile75,
            poorQualityRegionMin: _.first(pdb.emdbs)?.emv?.stats?.quartile25,
            proteinName: pdb.protein.name,
            ligandsAndSmallMoleculesCount,
            resolution: _.first(pdb.emdbs)?.emv?.stats?.resolutionMedian,
            chain: pdb.chainId,
            uniprotId: getEntityLinks(pdb, "uniprot")
                .map(link => link.name)
                .join(", "),
            genePhrase: geneName ? geneName + (geneBankEntry ?? "") : "",
        }),
        [pdb, geneName, geneBankEntry, ligandsAndSmallMoleculesCount]
    );

    const action = React.useCallback(
        (protvistaAction: ProtvistaAction) => {
            if (protvistaAction.type === "showDialog") {
                showNMRDialog();
                setNMRTarget({
                    start: protvistaAction.start,
                    end: protvistaAction.end,
                    uniprotId: pdb.protein.id,
                });
            }
        },
        [pdb.protein.id, setNMRTarget, showNMRDialog]
    );

    const renderBlocks = React.useMemo(
        () =>
            blocks.map((block, idx) => (
                <ProtvistaBlock
                    key={idx}
                    block={block}
                    namespace={namespace}
                    pdb={pdb}
                    selection={selection}
                    setSelection={setSelection}
                    setVisible={setBlockVisible}
                    protvistaAction={action}
                />
            )),
        [namespace, pdb, selection, blocks, setBlockVisible, setSelection, action]
    );

    return (
        <div style={styles.container}>
            {renderBlocks}
            {nmrTarget && (
                <NMRDialog
                    basicTarget={nmrTarget}
                    open={openNMRDialog}
                    closeDialog={closeNMRDialog}
                />
            )}
        </div>
    );
};

interface ProtvistaBlockProps extends Omit<BlockComponentProps, "setVisible"> {
    namespace: BlockProps["namespace"];
    setVisible: (block: BlockDef) => (visible: boolean) => void;
    protvistaAction?: (action: ProtvistaAction) => void;
}

const ProtvistaBlock: React.FC<ProtvistaBlockProps> = React.memo(props => {
    const { pdb, selection, setSelection, block, namespace, setVisible, protvistaAction } = props;
    const { compositionRoot } = useAppContext();
    const CustomComponent = block.component;

    const downloadTracks = React.useCallback(() => {
        return compositionRoot.exportAnnotations.execute(
            block.id,
            getBlockTracks(pdb.tracks, block),
            pdb.chainId
        );
    }, [compositionRoot.exportAnnotations, block, pdb.tracks, pdb.chainId]);

    return (
        <ViewerBlock
            key={block.id}
            block={block}
            namespace={namespace}
            onDownload={block.component === undefined ? downloadTracks : undefined}
        >
            {CustomComponent ? (
                <CustomComponent
                    pdb={pdb}
                    selection={selection}
                    block={block}
                    setVisible={setVisible(block)}
                    setSelection={setSelection}
                />
            ) : (
                <ProtvistaPdb pdb={pdb} block={block} onAction={protvistaAction} />
            )}

            {block.tracks.map((trackDef, idx) => {
                const CustomTrackComponent = trackComponentMapping[trackDef.id];
                return (
                    CustomTrackComponent && (
                        <CustomTrackComponent
                            block={block}
                            key={idx}
                            trackDef={trackDef}
                            pdb={pdb}
                            selection={selection}
                            setSelection={setSelection}
                        />
                    )
                );
            })}
        </ViewerBlock>
    );
});

const styles = {
    container: { padding: "1em 0 2em" },
};
