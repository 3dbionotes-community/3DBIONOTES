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
    const { trackDef } = props;
    const src = routes.bionotes + `/genomicIFrame?uniprot_acc=Q9BYF1`;
    const title = `${trackDef.name}: ${trackDef.description || "-"}`;

    return <FrameViewer title={title} src={src} />;
};
