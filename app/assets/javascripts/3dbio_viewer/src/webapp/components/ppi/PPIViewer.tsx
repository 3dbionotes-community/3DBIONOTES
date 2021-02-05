import React from "react";
import i18n from "../../utils/i18n";
import { ViewerBlock, ViewerBlockModel } from "../ViewerBlock";

interface PPiViewerProps {
    pdb?: string;
}

export const PPIViewer: React.FC<PPiViewerProps> = props => {
    const { pdb } = props;
    const src = `/ppiIFrame?pdb=${pdb || "6w9c"}`;
    const block: ViewerBlockModel = {
        id: "ppi-viewer",
        title: "PPI Viewer",
        description: i18n.t(`
            Protein–protein interactions (PPIs) are physical contacts of high specificity established between two or more protein molecules as a result of biochemical events steered by interactions that include electrostatic forces, hydrogen bonding and the hydrophobic effect. Many are physical contacts with molecular associations between chains that occur in a cell or in a living organism in a specific biomolecular context.
        `),
        help: "TODO",
    };

    return (
        <ViewerBlock block={block}>
            <iframe src={src} width="100%" height="800" />
        </ViewerBlock>
    );
};
