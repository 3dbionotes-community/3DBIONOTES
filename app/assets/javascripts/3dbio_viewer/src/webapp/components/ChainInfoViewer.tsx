import React from "react";
import { getEntityLinks, Pdb } from "../../domain/entities/Pdb";
import { Selection } from "../view-models/Selection";
import { Links } from "./Link";
import i18n from "../utils/i18n";
import _ from "lodash";

export interface ChainInfoProps {
    pdb: Pdb;
    selection: Selection;
}

interface Item {
    name: string;
    value: React.ReactNode;
    isDisabled?: boolean;
    help?: React.ReactNode;
}

export const ChainInfoViewer: React.FC<ChainInfoProps> = React.memo(props => {
    const { pdb } = props;
    const items: Item[] = getItems(pdb);

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

function getItems(pdb: Pdb): Item[] {
    return _.compact([
        { name: i18n.t("Gene Name"), value: pdb.protein.gen },
        {
            name: i18n.t("Gene Bank ID"),
            value: pdb.protein.genBank ? <Links links={getEntityLinks(pdb, "geneBank")} /> : "-",
        },
        {
            name: i18n.t("Uniprot ID"),
            value: <Links links={getEntityLinks(pdb, "uniprot")} />,
        },
    ]);
}
