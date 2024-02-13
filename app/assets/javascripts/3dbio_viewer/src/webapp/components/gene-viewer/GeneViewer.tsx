import React from "react";
import { routes } from "../../../routes";
import { Selection } from "../../view-models/Selection";
import { FrameViewer } from "../frame-viewer/FrameViewer";
import { TrackDef } from "../protvista/Protvista.types";
import { Protein } from "../../../domain/entities/Protein";

interface GeneViewerProps {
    trackDef: TrackDef;
    protein: Protein;
    selection: Selection;
}

export const GeneViewer: React.FC<GeneViewerProps> = props => {
    const { trackDef, protein } = props;
    const src = routes.bionotes + `/genomicIFrame?uniprot_acc=${protein.id.toUpperCase()}`;
    const title = `${trackDef.name}`;

    return <FrameViewer title={title} src={src} height={450} trackDef={trackDef} />;
};
