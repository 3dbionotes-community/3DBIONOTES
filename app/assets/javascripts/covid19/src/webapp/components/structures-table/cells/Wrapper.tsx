import React from "react";
import styled from "styled-components";
import { isEmpty } from "lodash";
import { Field } from "../Columns";
import { rowHeight } from "../StructuresTable";
import { BadgeDetails, OnClickDetails } from "../badge/BadgeDetails";
import { useHeightFromElement } from "../../../hooks/useHeightFromElement";
import { Structure } from "../../../../domain/entities/Covid19Info";
import { Link } from "../Link";
import i18n from "../../../../utils/i18n";

interface WrapperProps {
    moreDetails?: boolean;
    row: Structure;
    onClickDetails?: OnClickDetails;
    field: Field;
}

export const Wrapper: React.FC<WrapperProps> = React.memo(props => {
    const { moreDetails = true, onClickDetails, row, field } = props;
    const { ref, height } = useHeightFromElement<HTMLUListElement>();

    return (
        <Container moreDetails={moreDetails}>
            {isEmpty(props.children) && !moreDetails ? (
                <Link text={i18n.t("No {{field}} found", { field })} />
            ) : (
                <ul ref={ref}>{props.children}</ul>
            )}
            {height >= rowHeight - badgeHeight && moreDetails && (
                <div style={{ marginLeft: "40px" }}>
                    <BadgeDetails onClick={onClickDetails} row={row} field={field} />
                </div>
            )}
        </Container>
    );
});

const Container = styled.div<{ moreDetails: boolean }>`
    display: flex;
    flex-direction: column;
    overflow-wrap: anywhere;
    ul {
        ${props => (props.moreDetails ? "margin: 7px 0 2px;" : "margin:0;")}
        padding-left: 1.5em;
        ${props =>
            props.moreDetails &&
            "max-height: " +
                (rowHeight - badgeHeight) +
                "px; overflow-y: hidden; overflow-x: hidden;"}
    }
    li {
        line-height: 1.5;
    }
    & .MuiTypography-body1 {
        line-height: 1.5;
    }
    div {
        text-align: center;
    }
    p {
        overflow-wrap: anywhere;
    }
    ${props => props.moreDetails && "strong {font-weight: inherit;}"}
`;

const badgeHeight = 50;
