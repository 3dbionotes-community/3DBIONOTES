import React from "react";
import { Pdb } from "../../../domain/entities/Pdb";
import { routes } from "../../../routes";
import i18n from "../../utils/i18n";
import { SelectionState } from "../../view-models/SelectionState";
import { ViewerBlock, ViewerBlockModel } from "../ViewerBlock";

interface PPiViewerProps {
    pdb: Pdb;
    selection: SelectionState;
}

export const PPIViewer: React.FC<PPiViewerProps> = props => {
    const { pdb } = props;
    const src = routes.bionotes + `/ppiIFrame?pdb=${pdb.id}`;

    const block: ViewerBlockModel = {
        id: "ppiViewer",
        title: "PPI Viewer",
        description: i18n.t(
            "Protein–protein interactions (PPIs) are physical contacts of high specificity established between two or more protein molecules as a result of biochemical events steered by interactions that include electrostatic forces, hydrogen bonding and the hydrophobic effect. Many are physical contacts with molecular associations between chains that occur in a cell or in a living organism in a specific biomolecular context"
        ),
        help: "",
    };

    return (
        <ViewerBlock block={block}>
            <iframe src={src} width="100%" height="800" />
        </ViewerBlock>
    );
};
