import _ from "lodash";
import React from "react";
import { Pdb, PdbPublication } from "../../domain/entities/Pdb";
import { Selection } from "../view-models/Selection";
import i18n from "../utils/i18n";

export interface BasicInfoProps {
    pdb: Pdb;
    selection: Selection;
}

interface Item {
    name: string;
    value?: string;
}

export const BasicInfoEntry: React.FC<BasicInfoProps> = React.memo(props => {
    const { pdb } = props;

    const items: Item[] = React.useMemo(
        () =>
            (pdb.publications[0] && getItems(pdb.publications[0]).filter(item => item.value)) ?? [],
        [pdb.publications]
    );

    return (
        <ul>
            {items.map(({ name, value }, idx) => (
                <li key={idx}>
                    <span>
                        {name}: {value ?? "-"}
                    </span>
                </li>
            ))}
        </ul>
    );
});

function getItems(publication: PdbPublication) {
    const items: Item[] = [
        { name: i18n.t("Title"), value: publication.title },
        { name: i18n.t("Authors"), value: publication.authors.join(", ") },
        { name: i18n.t("Type"), value: publication.type },
        {
            name: i18n.t("Journal"),
            value: _.compact([
                publication.journalInfo.isoAbbreviation,
                publication.journalInfo.volume,
                publication.journalInfo.year && `(${publication.journalInfo.year})`,
            ]).join(" "),
        },
        { name: i18n.t("Related entries"), value: publication.relatedEntries.join(", ") },
        { name: i18n.t("PMID"), value: publication.pubmedId },
        { name: i18n.t("DOI"), value: publication.doi },
        { name: i18n.t("Abstract"), value: publication.abstract.unassigned },
    ];

    return items;
}
