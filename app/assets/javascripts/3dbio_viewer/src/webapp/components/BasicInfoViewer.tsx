import React from "react";
import { Pdb } from "../../domain/entities/Pdb";
import i18n from "../utils/i18n";
import { ViewerBlock, ViewerBlockModel } from "./ViewerBlock";

export interface BasicInfoProps {
    pdb: Pdb;
}

export const BasicInfoViewer: React.FC<BasicInfoProps> = React.memo(props => {
    const { pdb } = props;
    const block: ViewerBlockModel = {
        id: "basicInfo",
        title: "Basic information",
        description: i18n.t(`
            This section contains the basic information about the protein structure model that is being visualized, such as the name of the protein, the name of the gene, the organism in which it is expressed, its biological function, the experimental (or computational) method that has allowed knowing the structure and its resolution. Also, if there is a cryo-EM map associated with the model, it will be shown. The IDs of PDB, EMDB (in case of cryo-EM map availability) and Uniprot will be displayed.
        `),
        help: "TODO",
    };

    return (
        <ViewerBlock block={block}>
            {i18n.t("Protein Name")}: {pdb.protein.name}
        </ViewerBlock>
    );
});
