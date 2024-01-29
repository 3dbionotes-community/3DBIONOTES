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
import { getBlockTracks } from "./Protvista.helpers";
import i18n from "../../utils/i18n";
import "./protvista-pdb.css";
import "./ProtvistaViewer.css";

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
            pdb.protein?.gen
                ? i18n.t(" encoded by the gene {{geneName}}", { geneName: pdb.protein?.gen })
                : undefined,
        [pdb.protein]
    );

    const geneBankEntry = React.useMemo(
        () =>
            !_.isEmpty(pdb.protein?.genBank)
                ? i18n.t(" (GeneBank {{geneBankEntry}})", {
                      geneBankEntry: pdb.protein?.genBank?.join(", "),
                  })
                : undefined,
        [pdb.protein]
    );

    const namespace = React.useMemo(
        () => ({
            poorQualityRegionMax: _.first(pdb.emdbs)?.emv?.stats?.quartile75,
            poorQualityRegionMin: _.first(pdb.emdbs)?.emv?.stats?.quartile25,
            proteinName: pdb.protein?.name,
            ligandsAndSmallMoleculesCount,
            resolution: _.first(pdb.emdbs)?.emv?.stats?.resolutionMedian,
            chain: pdb.chainId,
            chainWithProtein: `${pdb.chainId}${pdb.protein?.name ? " - " + pdb.protein.name : ""}`,
            uniprotId: getEntityLinks(pdb, "uniprot")
                .map(link => link.name)
                .join(", "),
            genePhrase: geneName ? geneName + (geneBankEntry ?? "") : "",
        }),
        [pdb, geneName, geneBankEntry, ligandsAndSmallMoleculesCount]
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
                />
            )),
        [namespace, pdb, selection, blocks, setBlockVisible, setSelection]
    );

    return <div style={styles.container}>{renderBlocks}</div>;
};

interface ProtvistaBlockProps extends Omit<BlockComponentProps, "setVisible"> {
    namespace: BlockProps["namespace"];
    setVisible: (block: BlockDef) => (visible: boolean) => void;
}

const ProtvistaBlock: React.FC<ProtvistaBlockProps> = React.memo(props => {
    const { pdb, selection, setSelection, block, namespace, setVisible } = props;
    const { compositionRoot } = useAppContext();
    const CustomComponent = block.component;

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
                <ProtvistaPdb pdb={pdb} block={block} />
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
    container: { padding: "0 0 2em" },
};
