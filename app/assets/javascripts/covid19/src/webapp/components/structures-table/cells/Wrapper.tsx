import React from "react";
import styled from "styled-components";
import { Field } from "../Columns";
import { rowHeight } from "../StructuresTable";
import { BadgeDetails } from "../BadgeDetails";
import { useHeightFromElement } from "../../../hooks/useHeightFromElement";
import { Structure } from "../../../../domain/entities/Covid19Info";

interface WrapperProps {
    moreDetails?: boolean;
    row: Structure;
    onClickDetails?: (options: { row: Structure; field: Field }) => void;
    field: Field;
}

export const Wrapper: React.FC<WrapperProps> = React.memo(props => {
    const { moreDetails = true, onClickDetails, row, field } = props;
    const { ref, height } = useHeightFromElement<HTMLUListElement>();

    return (
        <Container moreDetails={moreDetails}>
            <ul ref={ref}>{props.children}</ul>
            {height >= rowHeight - badgeHeight && moreDetails && (
                <BadgeDetails onClick={onClickDetails} row={row} field={field} />
            )}
        </Container>
    );
});

const Container = styled.div<{ moreDetails: boolean }>`
    display: flex;
    flex-direction: column;
    line-height: 1.5;
    ul {
        ${props => (props.moreDetails ? "margin: 10px 0;" : "margin:0;")}
        ${props =>
            props.moreDetails &&
            "max-height: " +
                (rowHeight - badgeHeight) +
                "px; overflow-y: hidden; overflow-x: hidden;"}
    }
    div {
        text-align: center;
    }
    p {
        overflow-wrap: anywhere;
    }
`;

const badgeHeight = 62;
