import React from "react";
import _ from "lodash";
import { Pdb, getEntityLinks } from "../../../domain/entities/Pdb";
import { Selection } from "../../view-models/Selection";
import { ViewerBlock } from "../ViewerBlock";
import { ProtvistaPdb } from "./ProtvistaPdb";
import { BlockDef, BlockVisibility, TrackComponentProps } from "./Protvista.types";
import { PPIViewer } from "../ppi/PPIViewer";
import { GeneViewer } from "../gene-viewer/GeneViewer";
import { PdbInfo } from "../../../domain/entities/PdbInfo";
import { getSelectedChain } from "../viewer-selector/ViewerSelector";
import i18n from "../../utils/i18n";
import "./protvista-pdb.css";
import "./ProtvistaViewer.css";

export interface ProtvistaViewerProps {
    pdb: Pdb;
    pdbInfo: PdbInfo;
    selection: Selection;
    blocks: BlockDef[];
    setSelection: (newSelection: Selection) => void;
}

const trackComponentMapping: Partial<Record<string, React.FC<TrackComponentProps>>> = {
    "ppi-viewer": PPIViewer,
    "gene-viewer": GeneViewer,
};

export const ProtvistaViewer: React.FC<ProtvistaViewerProps> = props => {
    const { pdb, selection, blocks, pdbInfo, setSelection } = props;

    const [blocksVisibility, setBlocksVisibility] = React.useState(
        blocks.map(block => ({ block, visible: true }))
    );

    const setBlockVisibility = React.useCallback(
        (blockVisibility: BlockVisibility) =>
            setBlocksVisibility(
                blocksVisibility.map(i =>
                    i.block.id === blockVisibility.block.id ? blockVisibility : i
                )
            ),
        [blocksVisibility]
    );

    const selectedChain = React.useMemo(() => getSelectedChain(pdbInfo?.chains, selection), [
        pdbInfo,
        selection,
    ]);

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

    /* This snippet of code is just a patch and is intended to be well replaced with a better aproach, please. */
    // THIS IS A VERY BAD APPROACH, PLEASE REMOVE WHEN POSSIBLE
    const proteinPartners = React.useMemo(() => {
        const ppiFrame = [...document.getElementsByTagName("iframe")].find(
            frame => frame.name === "ppi"
        );
        if (ppiFrame && (ppiFrame.contentWindow as PPIWindow)) {
            if ((ppiFrame.contentWindow as PPIWindow).cytoscape_graph)
                /*sometimes prodcues error*/
                return (
                    (ppiFrame.contentWindow as PPIWindow).cytoscape_graph.elements.nodes.filter(
                        (node: { data: { shape: string } }) => node.data.shape === "ellipse"
                    ).length - 1
                );
            else return 0;
        } else return 0;
    }, []);

    const namespace = React.useMemo(
        () => ({
            poorQualityRegionMax: _.first(pdb.emdbs)?.emv?.stats?.quartile75,
            poorQualityRegionMin: _.first(pdb.emdbs)?.emv?.stats?.quartile25,
            proteinName: pdb.protein.name,
            ligandsAndSmallMoleculesCount,
            proteinPartners,
            resolution: _.first(pdb.emdbs)?.emv?.stats?.resolutionMedian,
            chain: pdb.chainId,
            uniprotId: getEntityLinks(pdb, "uniprot")
                .map(link => link.name)
                .join(", "),
            genePhrase: geneName ? geneName + (geneBankEntry ?? "") : "",
        }),
        [pdb, geneName, geneBankEntry, ligandsAndSmallMoleculesCount, proteinPartners]
    );

    const renderBlocks = React.useMemo(
        () =>
            blocksVisibility.map(({ block, visible }) => {
                const CustomComponent = block.component;
                return (
                    visible && (
                        <ViewerBlock key={block.id} block={block} namespace={namespace}>
                            {CustomComponent ? (
                                <CustomComponent
                                    pdb={pdb}
                                    selection={selection}
                                    setSelection={setSelection}
                                    block={block}
                                    setBlockVisibility={setBlockVisibility}
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
                    )
                );
            }),
        [blocksVisibility, namespace, pdb, selection, setSelection, setBlockVisibility]
    );

    return <div style={styles.container}>{renderBlocks}</div>;
};

const styles = {
    container: { padding: "1em 0 2em" },
};

interface PPIWindow extends Window {
    cytoscape_graph: any;
}
