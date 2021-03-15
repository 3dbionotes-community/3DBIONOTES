import React from "react";
import { Pdb } from "../../../domain/entities/Pdb";
import { routes } from "../../../routes";
import { SelectionState } from "../../view-models/SelectionState";
import { TrackDef } from "../protvista/Protvista.types";

interface PPiViewerProps {
    trackDef: TrackDef;
    pdb: Pdb;
    selection: SelectionState;
}

export const PPIViewer: React.FC<PPiViewerProps> = props => {
    const { pdb, trackDef } = props;
    const src = routes.bionotes + `/ppiIFrame?pdb=${pdb.id}`;

    return (
        <div>
            {trackDef.name}: {trackDef.description}
            <iframe src={src} width="100%" height="800" />
        </div>
    );
};
