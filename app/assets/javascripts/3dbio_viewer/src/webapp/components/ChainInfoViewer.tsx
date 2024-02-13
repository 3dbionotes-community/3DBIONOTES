import _ from "lodash";
import React from "react";
import { Selection } from "../view-models/Selection";
import { Links } from "./Link";
import { getProteinEntityLinks, Protein } from "../../domain/entities/Protein";
import i18n from "../utils/i18n";

export interface ChainInfoProps {
    protein: Protein;
    selection: Selection;
}

interface Item {
    name: string;
    value: React.ReactNode;
    isDisabled?: boolean;
    help?: React.ReactNode;
}

export const ChainInfoViewer: React.FC<ChainInfoProps> = React.memo(props => {
    const { protein } = props;
    const items: Item[] = getProteinItems(protein);

    return (
        <ul>
            {items
                .filter(item => !item.isDisabled)
                .map(item => (
                    <Child key={item.name} name={item.name} value={item.value} help={item.help} />
                ))}
        </ul>
    );
});

interface ChildProps {
    name: string;
    value: React.ReactNode;
    help?: React.ReactNode;
}

const Child: React.FC<ChildProps> = props => {
    const { name, value } = props;

    return (
        <li>
            <span>
                {name}: {value ?? "-"}
            </span>
        </li>
    );
};

function getProteinItems(protein: Protein): Item[] {
    return _.compact([
        { name: i18n.t("Gene Name"), value: protein.gen },
        {
            name: i18n.t("Gene Bank ID"),
            value: protein.genBank ? (
                <Links links={getProteinEntityLinks(protein, "geneBank")} />
            ) : (
                "-"
            ),
        },
        {
            name: i18n.t("Uniprot ID"),
            value: <Links links={getProteinEntityLinks(protein, "uniprot")} />,
        },
    ]);
}
