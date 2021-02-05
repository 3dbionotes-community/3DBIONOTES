import React from "react";
import i18n from "../utils/i18n";
import { ViewerBlock, ViewerBlockModel } from "./ViewerBlock";

export interface BasicInfoProps {}

export const BasicInfoViewer: React.FC<BasicInfoProps> = React.memo(() => {
    const block: ViewerBlockModel = {
        id: "basicInfo",
        title: "Basic information",
        description: i18n.t(`
                "This section contains the basic information about the protein structure model that is being visualized, such as the name of the protein, the name of the gene, the organism in which it is expressed, its biological function, the experimental (or computational) method that has allowed knowing the structure and its resolution. Also, if there is a cryo-EM map associated with the model, it will be shown. The IDs of PDB, EMDB (in case of cryo-EM map availability) and Uniprot will be displayed.

                Protein Name
                Gen Name
                Organism
                Biological function
                Obtaining method
                Uniprot ID
                PDB ID
                EMDB ID
                Resolution
            `),
        help: "TODO",
    };

    return <ViewerBlock block={block} />;
});
