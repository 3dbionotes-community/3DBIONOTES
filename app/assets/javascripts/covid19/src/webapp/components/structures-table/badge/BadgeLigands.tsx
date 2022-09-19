import React from "react";
import styled from "styled-components";
import { Badge } from "./Badge";
import { Ligand } from "../../../../domain/entities/Covid19Info";
import i18n from "../../../../utils/i18n";

export interface BadgeLigandsProps {
    onClick?: (options: { ligand: Ligand }) => void;
    ligand: Ligand;
}

export const BadgeLigands: React.FC<BadgeLigandsProps> = React.memo(props => {
    const { ligand, onClick } = props;

    const notifyClick = React.useCallback(
        e => {
            e.preventDefault();
            onClick?.({ ligand });
        },
        [onClick, ligand]
    );

    const openExternal = React.useCallback(() => {}, []);

    return (
        <BadgeGroup>
            <Badge onClick={notifyClick} backgroundColor={"w3-cyan"}>
                {i18n.t("IDR")} <i className="fa fa-info-circle icon-right"></i>
            </Badge>
            <Badge onClick={openExternal} backgroundColor={"w3-cyan"}>
                <i className="fa fa-external-link-square"></i>
            </Badge>
        </BadgeGroup>
    );
});

const BadgeGroup = styled.div`
    display: flex;
    justify-content: center;
`;
