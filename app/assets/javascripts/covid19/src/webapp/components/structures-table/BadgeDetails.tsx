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

    const notifyClick = React.useCallback(
        e => {
            e.preventDefault();
            onClick?.({ row, field });
        },
        [onClick, row, field]
    );

    return (
        <div>
            <BadgeButton onClick={notifyClick}>
                {i18n.t("View more")} <i className="fa fa-info-circle" style={styles.icon}></i>
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

const styles = {
    icon: { marginLeft: "5px" },
};
