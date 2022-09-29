import React from "react";
import styled from "styled-components";
import i18n from "../../../../utils/i18n";
import { Ligand } from "../../../../domain/entities/Covid19Info";
import { LigandImageData } from "../../../../domain/entities/LigandImageData";
import { BadgeLink } from "./BadgeLink";
import { IDROptions } from "../Columns";
import { Badge } from "./Badge";

export interface BadgeLigandsProps {
    onClick?: (options: IDROptions) => void;
    ligand: Ligand;
    moreDetails?: boolean;
    imageDataResource: LigandImageData;
}

export const BadgeLigands: React.FC<BadgeLigandsProps> = React.memo(props => {
    const { ligand, onClick, moreDetails = true, imageDataResource: idr } = props;

    const notifyClick = React.useCallback(
        e => {
            e.preventDefault();
            onClick?.({ ligand, idr });
        },
        [onClick, ligand, idr]
    );

    return moreDetails ? (
        <BadgeGroup>
            <Badge onClick={notifyClick} backgroundColor={"w3-cyan"}>
                {i18n.t("IDR")} <i className="fa fa-info-circle icon-right"></i>
            </Badge>
            <BadgeLink url={idr.externalLink} backgroundColor={"w3-cyan"} icon="external" />
        </BadgeGroup>
    ) : (
        <BadgeInlineGroup>
            <Badge onClick={notifyClick} backgroundColor={"w3-cyan"}>
                {i18n.t("IDR")} <i className="fa fa-info-circle icon-right"></i>
            </Badge>
            <BadgeLink url={idr.externalLink} backgroundColor={"w3-cyan"} icon="external" />
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
