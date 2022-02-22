import React, { useEffect, useRef, useState } from "react";
import { CellProps } from "../Columns";
import i18n from "../../../../utils/i18n";
import styled from "styled-components";
import { ellipsizedList } from "../../../utils/ellipsizedList";
import { HtmlTooltip } from "../HtmlTooltip";
import { rowHeight } from "../StructuresTable";
import { BadgeDetails } from "../BadgeDetails";

export const DetailsCell: React.FC<CellProps> = React.memo(props => {
    const { row, moreDetails, onClickDetails } = props;
    const { details } = row;
    const [height, setHeight] = useState(0);
    const ref = useRef<null | HTMLUListElement>(null);

    useEffect(() => {
        setHeight(ref.current?.getBoundingClientRect().height ?? 0);
    }, []);

    const Container = styled.div`
        display: flex;
        flex-direction: column;
        ul {
            ${moreDetails !== false ? "margin: 10px 0;" : "margin:0;"}
            ${moreDetails !== false &&
            "max-height: " + (rowHeight - 62) + "px; overflow-y: hidden; overflow-x: hidden;"}
        }
        div {
            text-align: center;
        }
        p {
            overflow-wrap: anywhere;
        }
    `;

    return (
        <Container>
            {details && (
                <ul ref={ref}>
                    <ListItem>
                        {i18n.t("Sample: {{name}}", {
                            nsSeparator: false,
                            name: details.sample?.name,
                        })}
                    </ListItem>
                    <ListItem>
                        {i18n.t("Macromolecules: ", { nsSeparator: false })}
                        <ul>
                            {details.sample?.macromolecules?.map(molecule => (
                                <ListItem>{molecule}</ListItem>
                            ))}
                        </ul>
                    </ListItem>
                    <ListItem>
                        {i18n.t("Assembly: {{assembly}}", {
                            nsSeparator: false,
                            assembly: details.sample?.assembly,
                        })}
                    </ListItem>
                    {!moreDetails && (
                        <>
                            <ListItem>
                                {i18n.t("Exp. System: {{exprSystem}}", {
                                    nsSeparator: false,
                                    exprSystem: details.sample?.exprSystem,
                                })}
                            </ListItem>
                            <ListItem>
                                {i18n.t("UniProt Ids: {{ids}}", {
                                    nsSeparator: false,
                                    ids: details.sample?.uniProts?.join(", "),
                                })}
                            </ListItem>
                            <ListItem>
                                {i18n.t("Genes: {{genes}}", {
                                    nsSeparator: false,
                                    genes: details.sample?.genes?.join(", "),
                                })}
                            </ListItem>
                            <ListItem>
                                {i18n.t("Biological Function: {{bioFunction}}", {
                                    nsSeparator: false,
                                    bioFunction: details.sample?.bioFunction?.join(", "),
                                })}
                            </ListItem>
                            <ListItem>
                                {i18n.t("Biological Process: {{bioProcess}}", {
                                    nsSeparator: false,
                                    bioProcess: details.sample?.bioProcess?.join(", "),
                                })}
                            </ListItem>
                            <ListItem>
                                {i18n.t("Cell Component: {{cellComponent}}", {
                                    nsSeparator: false,
                                    bioProcess: details.sample?.cellComponent?.join(", "),
                                })}
                            </ListItem>
                            <ListItem>
                                {i18n.t("Domains: {{domains}}", {
                                    nsSeparator: false,
                                    domains: details.sample?.domains?.join(", "),
                                })}
                            </ListItem>
                        </>
                    )}
                    {details?.refdoc?.map(ref => {
                        const abstractMaxLength = 190;
                        return (
                            <ListItem>
                                Publication:
                                <ul>
                                    {!moreDetails && (
                                        <ListItem>
                                            {i18n.t("ID: {{id}}", {
                                                nsSeparator: false,
                                                id: ref.id,
                                            })}
                                        </ListItem>
                                    )}
                                    <ListItem>
                                        {i18n.t("Title: {{title}}", {
                                            nsSeparator: false,
                                            title: ref.title,
                                        })}
                                    </ListItem>
                                    <HtmlTooltip
                                        title={
                                            <React.Fragment>
                                                <div>
                                                    {i18n.t("Authors: {{authors}}", {
                                                        nsSeparator: false,
                                                        authors: ref.authors.join(", "),
                                                    })}
                                                </div>
                                            </React.Fragment>
                                        }
                                    >
                                        <ListItem>
                                            {i18n.t("Authors: {{authors}}", {
                                                nsSeparator: false,
                                                authors: ellipsizedList(ref.authors),
                                            })}
                                        </ListItem>
                                    </HtmlTooltip>
                                    <ListItem>
                                        {i18n.t("Journal: {{journal}}", {
                                            nsSeparator: false,
                                            journal: ref.journal,
                                        })}
                                    </ListItem>
                                    {!moreDetails &&
                                        (ref.abstract ?? "").length < abstractMaxLength &&
                                        (ref.abstract ?? "").length != 0 && (
                                            <ListItem>
                                                {i18n.t("Abstract: {{abstract}}", {
                                                    nsSeparator: false,
                                                    abstract: ref.abstract,
                                                })}
                                            </ListItem>
                                        )}
                                    {!moreDetails &&
                                        (ref.abstract ?? "").length > abstractMaxLength &&
                                        (ref.abstract ?? "").length != 0 && (
                                            <HtmlTooltip
                                                title={
                                                    <React.Fragment>
                                                        <div>
                                                            {i18n.t("Abstract: {{abstract}}", {
                                                                nsSeparator: false,
                                                                abstract: ref.abstract,
                                                            })}
                                                        </div>
                                                    </React.Fragment>
                                                }
                                            >
                                                <ListItem>
                                                    {i18n.t("Abstract: {{abstract}}", {
                                                        nsSeparator: false,
                                                        abstract:
                                                            ref.abstract?.substring(
                                                                0,
                                                                abstractMaxLength
                                                            ) + "...",
                                                    })}
                                                </ListItem>
                                            </HtmlTooltip>
                                        )}
                                </ul>
                            </ListItem>
                        );
                    })}
                </ul>
            )}
            {height >= rowHeight - 62 && moreDetails !== false && (
                <BadgeDetails onClick={onClickDetails} row={row} field="details" />
            )}
        </Container>
    );
});

const ListItem = styled.li`
    font-size: 0.75rem;
`;
