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

export interface ProtvistaViewerProps {
    pdb: Pdb;
    selection: Selection;
    blocks: BlockDef[];
}

const trackComponentMapping: Partial<Record<string, React.FC<TrackComponentProps>>> = {
    "ppi-viewer": PPIViewer,
    "gene-viewer": GeneViewer,
};

export const ProtvistaViewer: React.FC<ProtvistaViewerProps> = props => {
    const { pdb, selection, blocks } = props;

    const geneName = React.useMemo(
        () =>
            pdb.protein.gene
                ? i18n.t(" encoded by the gene {{geneName}}", { geneName: pdb.protein.gene })
                : undefined,
        [pdb.protein]
    );

    const geneBankEntry = React.useMemo(
        () =>
            !_.isEmpty(pdb.protein.geneBank)
                ? i18n.t(" (GeneBank {{geneBankEntry}})", {
                      geneBankEntry: pdb.protein.geneBank?.join(", "),
                  })
                : undefined,
        [pdb.protein]
    );

    const namespace = React.useMemo(
        () => ({
            // alphaHelices: "TODO",
            // betaSheets: "TODO",
            // disorderedRegionRange: "TODO",
            // domains: "TODO",
            poorQualityRegionMax: _.first(pdb.emdbs)?.emv?.stats?.quartile75,
            poorQualityRegionMin: _.first(pdb.emdbs)?.emv?.stats?.quartile25,
            // proteinInteractsMoreCount: "TODO",
            // proteinInteractsWith: "TODO",
            proteinName: pdb.protein.name,
            proteinPartners: "TODO",
            resolution: _.first(pdb.emdbs)?.emv?.stats?.resolutionMedian,
            // transmembraneAlphaHelices: "TODO",
            // transmembraneExternalRegions: "TODO",
            // transmembraneResidues: "TODO",
            // turns: "TODO",
            chain: pdb.chainId,
            uniprotId: getEntityLinks(pdb, "uniprot")
                .map(link => link.name)
                .join(", "),
            genePhrase: geneName ? geneName + (geneBankEntry ?? "") : "",
        }),
        [pdb, geneName, geneBankEntry]
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
