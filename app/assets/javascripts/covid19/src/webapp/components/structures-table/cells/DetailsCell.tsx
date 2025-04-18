import _ from "lodash";
import React from "react";
import styled from "styled-components";
import { CellProps } from "../Columns";
import { ellipsizedList } from "../../../utils/ellipsizedList";
import { HtmlTooltip } from "../HtmlTooltip";
import { Wrapper } from "./Wrapper";
import { RefDoc } from "../../../../domain/entities/Covid19Info";
import { Link } from "../Link";
import i18n from "../../../../utils/i18n";

export const DetailsCell: React.FC<CellProps> = React.memo(props => {
    const { row, moreDetails, onClickDetails } = props;
    const { details } = row;

    return (
        <Wrapper
            onClickDetails={onClickDetails}
            moreDetails={moreDetails}
            row={row}
            field="details"
        >
            {details && (
                <>
                    <ListItem name={i18n.t("Sample")} value={details.sample?.name} />
                    {details.sample?.macromolecules && (
                        <ListItem name={i18n.t("Macromolecules")}>
                            <ul>
                                {details.sample.macromolecules.map((molecule, idx) => (
                                    <Li key={idx}>{molecule}</Li>
                                ))}
                            </ul>
                        </ListItem>
                    )}
                    <ListItem name={i18n.t("Assembly")} value={details.sample?.assembly} />
                    {!moreDetails && (
                        <>
                            <ListItem
                                name={i18n.t("Exp. System")}
                                value={details.sample?.exprSystem}
                            />
                            <ListItem
                                name={i18n.t("UniProt Ids")}
                                value={details.sample?.uniProts?.join(", ")}
                            />
                            <ListItem
                                name={i18n.t("Genes")}
                                value={details.sample?.genes?.join(", ")}
                            />
                            <ListItem
                                name={i18n.t("Biological Function")}
                                value={details.sample?.bioFunction?.join(", ")}
                            />
                            <ListItem
                                name={i18n.t("Biological Process")}
                                value={details.sample?.bioProcess?.join(", ")}
                            />
                            <ListItem
                                name={i18n.t("Cell Component")}
                                value={details.sample?.cellComponent?.join(", ")}
                            />
                            <ListItem
                                name={i18n.t("Details")}
                                value={details.sample?.domains?.join(", ")}
                            />
                        </>
                    )}
                    {details?.refdoc?.map((refDoc, idx) => (
                        <RefDocLi refDoc={refDoc} key={idx} moreDetails={moreDetails} />
                    ))}
                </>
            )}
        </Wrapper>
    );
});

const Li = styled.li`
    font-size: 0.75rem;
    font-family: "Roboto", "Helvetica", "Arial", sans-serif;
    font-weight: 400;
    line-height: 1.5;
    letter-spacing: 0.00938em;
    p {
        display: inline-block;
    }
`;

const ListItem: React.FC<ListItemProps> = React.memo(props => {
    const { name, value } = props;
    return (
        <>
            {(value || props.children) && (
                <Li>
                    <strong>{`${name}:`}</strong>
                    {` ${value ?? ""}`}
                    {props.children}
                </Li>
            )}
        </>
    );
});

const RefDocLi: React.FC<RefDocLiProps> = React.memo(props => {
    const { refDoc, moreDetails = true } = props;

    return (
        <Li>
            <strong>{i18n.t("Publication")}:</strong>
            <ul>
                {!moreDetails && !_.isEmpty(refDoc.id.trim()) && (
                    <ListItem name={i18n.t("ID")}>
                        <Link url={refDoc.idLink} text={refDoc.id}></Link>
                    </ListItem>
                )}

                <ListItem name={i18n.t("Title")} value={refDoc.title} />

                <HtmlTooltip title={<div>{refDoc.authors.join(", ")}</div>}>
                    <Li>
                        <strong>{`${i18n.t("Authors")}:`}</strong>
                        {` ${ellipsizedList(refDoc.authors)}`}
                    </Li>
                </HtmlTooltip>

                <ListItem name={i18n.t("Journal")} value={refDoc.journal} />

                <ListItem name={i18n.t("Date")} value={refDoc.pubDate} />

                {!moreDetails && refDoc.doi && (
                    <ListItem name="DOI">
                        <Link url={refDoc.doi} text={refDoc.doi}></Link>
                    </ListItem>
                )}
            </ul>
        </Li>
    );
});

export interface ListItemProps {
    name: string;
    value?: string;
}

interface RefDocLiProps {
    refDoc: RefDoc;
    moreDetails?: boolean;
}
