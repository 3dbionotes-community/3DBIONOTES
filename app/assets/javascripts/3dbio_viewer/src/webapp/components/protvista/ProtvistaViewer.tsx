import React from "react";
import _ from "lodash";
import { Pdb, getEntityLinks } from "../../../domain/entities/Pdb";
import { Selection } from "../../view-models/Selection";
import { ViewerBlock } from "../ViewerBlock";
import { ProtvistaPdb } from "./ProtvistaPdb";
import { BlockDef, TrackComponentProps } from "./Protvista.types";
import "./protvista-pdb.css";
import "./ProtvistaViewer.css";
import { PPIViewer } from "../ppi/PPIViewer";
import { GeneViewer } from "../gene-viewer/GeneViewer";
import i18n from "../../utils/i18n";
import { PdbInfo } from "../../../domain/entities/PdbInfo";
import { getSelectedChain } from "../viewer-selector/ViewerSelector";

export interface ProtvistaViewerProps {
    pdb: Pdb;
    pdbInfo: PdbInfo;
    selection: Selection;
    blocks: BlockDef[];
}

const trackComponentMapping: Partial<Record<string, React.FC<TrackComponentProps>>> = {
    "ppi-viewer": PPIViewer,
    "gene-viewer": GeneViewer,
};

export const ProtvistaViewer: React.FC<ProtvistaViewerProps> = props => {
    const { pdb, selection, blocks, pdbInfo } = props;

    const selectedChain = React.useMemo(() => getSelectedChain(pdbInfo, selection), [
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
        if (ppiFrame && ppiFrame.contentWindow)
            return (
                (ppiFrame.contentWindow as PPIWindow).cytoscape_graph.elements.nodes.filter(
                    (node: { data: { shape: string } }) => node.data.shape === "ellipse"
                ).length - 1
            );
        else return 0;
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

    return (
        <div style={styles.container}>
            {blocks.map(block => {
                const CustomComponent = block.component;
                return (
                    <ViewerBlock key={block.id} block={block} namespace={namespace}>
                        {CustomComponent ? (
                            <CustomComponent pdb={pdb} selection={selection} block={block} />
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
                                    />
                                )
                            );
                        })}
                    </ViewerBlock>
                );
            })}
        </div>
    );
};

const styles = {
    container: { padding: "1em 0 2em" },
};

interface PPIWindow extends Window {
    cytoscape_graph: any;
}
