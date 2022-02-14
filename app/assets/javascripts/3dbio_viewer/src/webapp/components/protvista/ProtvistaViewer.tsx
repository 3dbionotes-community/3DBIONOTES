import React from "react";
import _ from "lodash";
import { Pdb } from "../../../domain/entities/Pdb";
import { Selection } from "../../view-models/Selection";
import { ViewerBlock } from "../ViewerBlock";
import { ProtvistaPdb } from "./ProtvistaPdb";
import { BlockDef, TrackComponentProps } from "./Protvista.types";
import "./protvista-pdb.css";
import "./ProtvistaViewer.css";
import { PPIViewer } from "../ppi/PPIViewer";
import { GeneViewer } from "../gene-viewer/GeneViewer";
import { UploadData } from "../../../domain/entities/UploadData";
import { Maybe } from "../../../utils/ts-utils";

export interface ProtvistaViewerProps {
    pdb: Pdb;
    selection: Selection;
    blocks: BlockDef[];
    uploadData: Maybe<UploadData>;
}

const mapping: Partial<Record<string, React.FC<TrackComponentProps>>> = {
    "ppi-viewer": PPIViewer,
    "gene-viewer": GeneViewer,
};

export const ProtvistaViewer: React.FC<ProtvistaViewerProps> = props => {
    const { pdb, selection, blocks, uploadData } = props;

    const namespace = {
        alphaHelices: "TODO",
        betaSheets: "TODO",
        disorderedRegionRange: "TODO",
        domains: "TODO",
        modifiedOrRefinementAminoAcids: "TODO",
        poorQualityRegionMax: "TODO",
        poorQualityRegionMin: "TODO",
        proteinInteractsMoreCount: "TODO",
        proteinInteractsWith: "TODO",
        proteinName: pdb.protein.name,
        proteinPartners: "TODO",
        resolution: pdb.experiment?.resolution,
        transmembraneAlphaHelices: "TODO",
        transmembraneExternalRegions: "TODO",
        transmembraneResidues: "TODO",
        turns: "TODO",
    };

    return (
        <div>
            {blocks.map(block => {
                const CustomComponent = block.component;
                return (
                    <ViewerBlock key={block.id} block={block} namespace={namespace}>
                        {CustomComponent ? (
                            <CustomComponent pdb={pdb} selection={selection} />
                        ) : (
                            <ProtvistaPdb pdb={pdb} block={block} uploadData={uploadData} />
                        )}

                        {block.tracks.map((trackDef, idx) => {
                            const CustomTrackComponent = mapping[trackDef.id];
                            return (
                                CustomTrackComponent && (
                                    <CustomTrackComponent
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
