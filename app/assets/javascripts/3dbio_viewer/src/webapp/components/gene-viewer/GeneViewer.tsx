import React from "react";
import { Pdb } from "../../../domain/entities/Pdb";
import { routes } from "../../../routes";
import { SelectionState } from "../../view-models/SelectionState";
import { FrameViewer } from "../frame-viewer/FrameViewer";
import { TrackDef } from "../protvista/Protvista.types";

interface GeneViewerProps {
    trackDef: TrackDef;
    pdb: Pdb;
    selection: SelectionState;
}

export const GeneViewer: React.FC<GeneViewerProps> = props => {
    const { trackDef } = props;
    const src = routes.bionotes + `/genomicIFrame?uniprot_acc=Q9BYF1`;
    const title = trackDef.name;

    return <FrameViewer title={title} src={src} />;
};
