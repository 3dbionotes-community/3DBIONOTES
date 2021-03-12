import React from "react";
import { Pdb } from "../../domain/entities/Pdb";
import i18n from "../utils/i18n";
import { ViewerBlock, ViewerBlockModel } from "./ViewerBlock";

export interface BasicInfoProps {
    pdb: Pdb;
    emdbId?: string;
}

export const BasicInfoViewer: React.FC<BasicInfoProps> = React.memo(props => {
    const { pdb, emdbId } = props;

    const block: ViewerBlockModel = {
        id: "basicInfo",
        title: "Basic information",
        description: i18n.t(`
            This section contains the basic information about the protein structure model that is being visualized, such as the name of the protein, the name of the gene, the organism in which it is expressed, its biological function, the experimental (or computational) method that has allowed knowing the structure and its resolution. Also, if there is a cryo-EM map associated with the model, it will be shown. The IDs of PDB, EMDB (in case of cryo-EM map availability) and Uniprot will be displayed.
        `),
        help: "TODO",
    };

    const subtracks = [
        { name: i18n.t("Protein Name"), value: pdb.protein.name },
        { name: i18n.t("Gene Name"), value: pdb.protein.gene },
        { name: i18n.t("Organism"), value: pdb.protein.organism },
        {
            name: i18n.t("Biological function"),
            value: "TODO",
            help: i18n.t(
                "Go annotations (ontology) about molecular function or using a description given by Uniprot (Link to Uniprot/Enzyme expasy (in the case of enzymes))"
            ),
        },
        { name: i18n.t("Obtaining method"), value: "TODO" },
        { name: i18n.t("Uniprot ID"), value: pdb.protein.id },
        { name: i18n.t("PDB ID"), value: pdb.id },
        {
            name: i18n.t("EMDB ID"),
            value: emdbId,
            help: i18n.t(
                "Do you want to load the associated map with this protein structure? (Pop-up window when loading the protein viewer or option here)"
            ),
        },
        {
            name: i18n.t("Resolution"),
            value: pdb.experiment?.resolution,
            help: i18n.t(
                "This determines the possible use given to the structure of the protein (Å). Depending on the global resolution range and the local resolution of the relevant sites, we can introduce the possible uses depending on the tables that are usually used (ex. https://science.sciencemag.org/content/294/5540/93)"
            ),
        },
    ];

    return (
        <ViewerBlock block={block}>
            <Parent>
                {subtracks.map(subtrack => (
                    <Child
                        key={subtrack.name}
                        name={subtrack.name}
                        value={subtrack.value}
                        help={subtrack.help}
                    />
                ))}
            </Parent>
        </ViewerBlock>
    );
});

const Parent: React.FC = ({ children }) => {
    return <ul>{children}</ul>;
};

interface ChildProps {
    name: string;
    value: number | string | undefined;
    help?: string;
}

const Child: React.FC<ChildProps> = props => {
    const { name, value, help } = props;

    return (
        <ul>
            {name}: {value ?? "-"}
            {help && (
                <span style={{ marginLeft: 10 }} title={help}>
                    [?]
                </span>
            )}
        </ul>
    );
};
