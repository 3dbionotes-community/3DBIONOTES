import _ from "lodash";
import React from "react";
import { Protein, getProteinEntityLinks } from "../../../domain/entities/Protein";
import { Pdb } from "../../../domain/entities/Pdb";
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
import { Maybe } from "../../../utils/ts-utils";
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

const trackComponentMapping: (
    protein: Maybe<Protein>
) => Partial<Record<string, React.FC<TrackComponentProps>>> = protein => ({
    "ppi-viewer": PPIViewer,
    "gene-viewer": protein && (props => GeneViewer({ ...props, protein })),
});

export const ProtvistaViewer: React.FC<ProtvistaViewerProps> = props => {
    const { pdb, selection, blocks, pdbInfo, setBlockVisibility, setSelection } = props;

    const [nmrTarget, setNMRTarget] = React.useState<BasicNMRFragmentTarget>();
    const [openNMRDialog, { enable: showNMRDialog, disable: closeNMRDialog }] = useBooleanState(
        false
    );

    const protein = pdb.protein;

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

    const geneName = React.useMemo(() => {
        if (!protein || !protein.gen) return;
        return i18n.t(" encoded by the gene {{geneName}}", { geneName: protein.gen });
    }, [protein]);

    const geneBankEntry = React.useMemo(() => {
        if (!protein || _.isEmpty(protein.genBank)) return;
        return i18n.t(" (GeneBank {{geneBankEntry}})", {
            geneBankEntry: protein.genBank?.join(", "),
        });
    }, [protein]);

    const namespace = React.useMemo(
        () => ({
            poorQualityRegionMax: _.first(pdb.emdbs)?.emv?.stats?.quartile75,
            poorQualityRegionMin: _.first(pdb.emdbs)?.emv?.stats?.quartile25,
            proteinName: protein?.name,
            ligandsAndSmallMoleculesCount,
            resolution: _.first(pdb.emdbs)?.emv?.stats?.resolutionMedian,
            chain: pdb.chainId,
            chainWithProtein: `${pdb.chainId}${protein?.name ? " - " + protein.name : ""}`,
            uniprotId:
                protein &&
                getProteinEntityLinks(protein, "uniprot")
                    .map(link => link.name)
                    .join(", "),
            genePhrase: geneName ? geneName + (geneBankEntry ?? "") : "",
        }),
        [pdb, geneName, geneBankEntry, ligandsAndSmallMoleculesCount, protein]
    );

    const action = React.useCallback(
        (protvistaAction: ProtvistaAction) => {
            if (protvistaAction.type === "showDialog" && protein) {
                showNMRDialog();
                setNMRTarget({
                    start: protvistaAction.start,
                    end: protvistaAction.end,
                    uniprotId: protein.id,
                });
            }
        },
        [protein, setNMRTarget, showNMRDialog]
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

    const trackComponents = React.useMemo(() => trackComponentMapping(pdb.protein), [pdb.protein]);

    const downloadTracks = React.useCallback(() => {
        return compositionRoot.exportAnnotations.execute(
            block.id,
            getBlockTracks(pdb.tracks, block),
            pdb.chainId
        );
    }, [compositionRoot.exportAnnotations, block, pdb.tracks, pdb.chainId]);

    const modifiedBlock = //shouldn't also the block itself be hidden?
        block.id === "mapValidation" &&
        (!_.first(pdb.emdbs)?.emv?.stats || (selection.type == "free" && !selection.main.emdb))
            ? { ...block, description: "" }
            : block;

    return (
        <ViewerBlock
            key={block.id}
            block={modifiedBlock}
            namespace={namespace}
            onDownload={!_.isEmpty(block.tracks) ? downloadTracks : undefined}
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
                <ProtvistaPdb
                    pdb={pdb}
                    block={block}
                    setVisible={setVisible(block)}
                    onAction={protvistaAction}
                />
            )}

            {block.tracks.map((trackDef, idx) => {
                const CustomTrackComponent = trackComponents[trackDef.id];
                return (
                    CustomTrackComponent && (
                        <CustomTrackComponent
                            block={block}
                            key={idx}
                            trackDef={trackDef}
                            pdb={pdb}
                            selection={selection}
                            setSelection={setSelection}
                            setVisible={setVisible(block)}
                        />
                    )
                );
            })}
        </ViewerBlock>
    );
});

const styles = {
    container: { padding: "0 0 2em" },
};
