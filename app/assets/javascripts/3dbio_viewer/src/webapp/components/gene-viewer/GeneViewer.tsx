import React from "react";
import { Pdb } from "../../../domain/entities/Pdb";
import { routes } from "../../../routes";
import { Selection } from "../../view-models/Selection";
import { FrameViewer } from "../frame-viewer/FrameViewer";
import { TrackDef } from "../protvista/Protvista.types";

interface GeneViewerProps {
    trackDef: TrackDef;
    pdb: Pdb;
    selection: Selection;
}

export const GeneViewer: React.FC<GeneViewerProps> = props => {
    const { trackDef, pdb } = props;
    if (!pdb.protein) throw new Error("No UniprotID to show GeneViewer");
    const src = routes.bionotes + `/genomicIFrame?uniprot_acc=${pdb.protein.id.toUpperCase()}`;
    const title = `${trackDef.name}`;

    return <FrameViewer title={title} src={src} height={450} trackDef={trackDef} />;
};
