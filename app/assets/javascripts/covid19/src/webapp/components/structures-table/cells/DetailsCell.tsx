import React from "react";
import { CellProps } from "../Columns";
import i18n from "../../../../utils/i18n";
import styled from "styled-components";
import { ellipsizedList } from "../../../utils/ellipsizedList";
import { HtmlTooltip } from "../HtmlTooltip";
import { Wrapper } from "./Wrapper";
import { RefDoc } from "../../../../domain/entities/Covid19Info";

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
                    <ListItem name={i18n.t("Macromolecules")}>
                        <ul>
                            {details.sample?.macromolecules?.map((molecule, idx) => (
                                <Li key={idx}>{molecule}</Li>
                            ))}
                        </ul>
                    </ListItem>
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
                        <RefDocLi refDoc={refDoc} idx={idx} moreDetails={moreDetails} />
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
`;

const ListItem: React.FC<ListItemProps> = React.memo(props => {
    const { name, value } = props;
    return (
        <>
            {(value || props.children) && (
                <Li>
                    {`${name}: ${value ?? ""}`}
                    {props.children}
                </Li>
            )}
        </>
    );
});

const RefDocLi: React.FC<RefDocLiProps> = React.memo(props => {
    const { refDoc, idx, moreDetails = true } = props;
    const abstractMaxLength = 190;
    const abstract = refDoc.abstract ?? "";
    return (
        <Li key={idx}>
            Publication:
            <ul>
                {!moreDetails && <ListItem name={i18n.t("ID")} value={refDoc.id} />}
                <ListItem name={i18n.t("Title")} value={refDoc.title} />
                <HtmlTooltip
                    title={
                        <React.Fragment>
                            <div>{refDoc.authors.join(", ")}</div>
                        </React.Fragment>
                    }
                >
                    <Li>{`${i18n.t("Authors")}: ${ellipsizedList(refDoc.authors)}`}</Li>
                </HtmlTooltip>
                <ListItem name={i18n.t("Journal")} value={refDoc.journal} />
                {!moreDetails && abstract.length < abstractMaxLength && abstract.length !== 0 && (
                    <ListItem name={i18n.t("Abstract")} value={refDoc.abstract} />
                )}
                {!moreDetails && abstract.length > abstractMaxLength && abstract.length !== 0 && (
                    <HtmlTooltip title={<>{refDoc.abstract}</>}>
                        <Li>{`${i18n.t("Abstract")}: ${
                            refDoc.abstract?.substring(0, abstractMaxLength) + "..."
                        }`}</Li>
                    </HtmlTooltip>
                )}
            </ul>
        </Li>
    );
});

interface ListItemProps {
    name: string;
    value?: string;
}

interface RefDocLiProps {
    refDoc: RefDoc;
    idx: number;
    moreDetails?: boolean;
}
