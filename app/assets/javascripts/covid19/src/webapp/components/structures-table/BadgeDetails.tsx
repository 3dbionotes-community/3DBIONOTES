import React from "react";
import { Badge } from "./Badge";
import { colors } from "./BadgeLink";
import { Field } from "./Columns";
import styled from "styled-components";
import i18n from "../../../utils/i18n";
import { Structure } from "../../../domain/entities/Covid19Info";

export interface BadgeDetailsProps {
    onClick?: (options: { row: Structure; field: Field }) => void;
    row: Structure;
    field: Field;
}

export const BadgeDetails: React.FC<BadgeDetailsProps> = React.memo(props => {
    const { row, field, onClick } = props;

    return (
        <div>
            <BadgeButton
                onClick={e => {
                    e.preventDefault();
                    onClick && onClick({ row: row, field: field });
                }}
            >
                {i18n.t("View more")}{" "}
                <i className="fa fa-info-circle" style={{ marginLeft: "5px" }}></i>
            </BadgeButton>
        </div>
    );
});

export const BadgeButton = styled(Badge)`
    display: inline-flex;
    justify-content: center;
    margin-bottom: 12.5px;
    cursor: pointer;
    color: #ffffff;
    background-color: ${colors["w3-turq"]};
`;
