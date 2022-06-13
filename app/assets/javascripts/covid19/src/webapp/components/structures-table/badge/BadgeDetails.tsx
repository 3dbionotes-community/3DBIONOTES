import React from "react";
import { Badge } from "./Badge";
import { Field } from "../Columns";
import i18n from "../../../../utils/i18n";
import { Structure } from "../../../../domain/entities/Covid19Info";

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
            <Badge onClick={notifyClick} backgroundColor={"w3-turq"}>
                {i18n.t("View more")} <i className="fa fa-info-circle icon-right"></i>
            </Badge>
        </div>
    );
});
