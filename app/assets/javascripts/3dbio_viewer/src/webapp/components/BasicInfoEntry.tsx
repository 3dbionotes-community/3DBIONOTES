import _ from "lodash";
import React from "react";
import { Pdb, PdbPublication } from "../../domain/entities/Pdb";
import { DbItem, MainType, Selection, buildDbItem } from "../view-models/Selection";
import i18n from "../utils/i18n";
import { Anchor } from "./Anchor";

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
        itemToAdd?: DbItem<MainType>;
    }[];
}

export const BasicInfoEntry: React.FC<BasicInfoProps> = React.memo(props => {
    const { pdb, selection, setSelection } = props;

    const addOverlayItem = React.useCallback(
        (item: DbItem<MainType>) => () =>
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
                                            <Anchor key={idx} href={href}>
                                                {value}
                                            </Anchor>
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
    const items: Item[] = _.compact([
        { name: i18n.t("Title"), value: escapeHTML(publication.title) },
        { name: i18n.t("Abstract"), value: escapeHTML(publication.abstract.unassigned) },
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
        publication.pubmedId && {
            name: i18n.t("PMID"),
            links: [
                {
                    value: publication.pubmedId,
                    href: publication.pubmedUrl,
                },
            ],
        },
        publication.doi && {
            name: i18n.t("DOI"),
            links: [
                {
                    value: publication.doi,
                    href: publication.doiUrl,
                },
            ],
        },
    ]);

    return items;
}

function escapeHTML(str?: string) {
    const t = document.createElement("div");
    t.innerHTML = str ?? "";
    [...t.children].forEach(el => el.remove());
    return str ? t.innerText : undefined;
}
