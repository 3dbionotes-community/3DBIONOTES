import React, { MouseEvent } from "react";
import styled from "styled-components";
import { Badge } from "./Badge";
import { useAppContext } from "../../../contexts/app-context";
import i18n from "../../../../utils/i18n";

export interface BadgeEntitiesProps {
    moreDetails?: boolean;
}

export const BadgeEntities: React.FC<BadgeEntitiesProps> = React.memo(props => {
    const { compositionRoot } = useAppContext();

    const { moreDetails = true } = props;
    const notifyClick = React.useCallback((e: MouseEvent) => {
        e.preventDefault();
    }, []);

    return moreDetails ? (
        <BadgeGroup>
            <Badge onClick={notifyClick} backgroundColor={"w3-deep-purple"}>
                {i18n.t("C19-NMR")} <i className="fa fa-info-circle icon-right"></i>
            </Badge>
        </BadgeGroup>
    ) : (
        <BadgeInlineGroup>
            <Badge onClick={notifyClick} backgroundColor={"w3-deep-purple"}>
                {i18n.t("C19-NMR")} <i className="fa fa-info-circle icon-right"></i>
            </Badge>
        </BadgeInlineGroup>
    );
});

const BadgeGroup = styled.div`
    display: flex;
    justify-content: center;
`;

const BadgeInlineGroup = styled.div`
    display: inline-flex;
    align-items: flex-end;
    justify-content: center;
`;
