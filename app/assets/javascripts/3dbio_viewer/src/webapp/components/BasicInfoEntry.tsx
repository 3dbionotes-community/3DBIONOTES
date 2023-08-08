import _ from "lodash";
import React from "react";
import { Pdb, PdbPublication } from "../../domain/entities/Pdb";
import { DbItem, Selection, buildDbItem } from "../view-models/Selection";
import i18n from "../utils/i18n";

export interface BasicInfoProps {
    pdb: Pdb;
    selection: Selection;
    setSelection: (newSelection: Selection) => void;
}

interface Item {
    name: string;
    value?: string;
    links?: {
        value: string;
        href?: string;
        itemToAdd?: DbItem;
    }[];
}

export const BasicInfoEntry: React.FC<BasicInfoProps> = React.memo(props => {
    const { pdb, selection, setSelection } = props;

    const addOverlayItem = React.useCallback(
        (item: DbItem) => () =>
            selection.type === "free" &&
            setSelection({
                ...selection,
                overlay: [...selection.overlay, item],
            }),
        [setSelection, selection]
    );

    const items: Item[] = React.useMemo(
        () =>
            (pdb.publications[0] &&
                getItems(pdb.publications[0]).filter(item => item.value || item.links)) ??
            [],
        [pdb.publications]
    );

    return (
        <ul>
            {items.map(({ name, value, links }, idx) => (
                <li key={idx}>
                    {!links && (
                        <span>
                            {name}: {value ?? "-"}
                        </span>
                    )}
                    {links && (
                        <span>
                            {name}:{" "}
                            {links.map(({ value, href, itemToAdd }, idx) => {
                                if (href)
                                    return (
                                        <React.Fragment key={idx}>
                                            <a
                                                key={idx}
                                                href={href}
                                                target="_blank"
                                                rel="noreferrer noopener"
                                            >
                                                {value}
                                            </a>
                                            {links.length != 1 && idx < links.length - 1 && ", "}
                                        </React.Fragment>
                                    );
                                else if (itemToAdd)
                                    return (
                                        <React.Fragment key={idx}>
                                            <span
                                                className="anchor"
                                                onClick={addOverlayItem(itemToAdd)}
                                            >
                                                {value}
                                            </span>
                                            {links.length != 1 && idx < links.length - 1 && ", "}
                                        </React.Fragment>
                                    );
                            })}
                        </span>
                    )}
                </li>
            ))}
        </ul>
    );
});

function getItems(publication: PdbPublication) {
    const items: Item[] = [
        { name: i18n.t("Title"), value: publication.title },
        { name: i18n.t("Abstract"), value: publication.abstract.unassigned },
        { name: i18n.t("Authors"), value: publication.authors.join(", ") },
        {
            name: i18n.t("Journal"),
            value: _.compact([
                publication.journalInfo.isoAbbreviation,
                publication.journalInfo.volume,
                publication.journalInfo.year && "(" + publication.journalInfo.year + ")",
            ]).join(" "),
        },
        {
            name: i18n.t("Related entries"),
            links: publication.relatedEntries.map(entry => ({
                value: entry,
                itemToAdd: buildDbItem(entry),
            })),
        },
        {
            name: i18n.t("PMID"),
            links: publication.pubmedId
                ? [
                      {
                          value: publication.pubmedId,
                          href: "//europepmc.org/article/MED/" + publication.pubmedId,
                      },
                  ]
                : undefined,
        },
        {
            name: i18n.t("DOI"),
            links: publication.doi
                ? [
                      {
                          value: publication.doi,
                          href: "//dx.doi.org/" + publication.doi,
                      },
                  ]
                : undefined,
        },
    ];

    return items;
}
