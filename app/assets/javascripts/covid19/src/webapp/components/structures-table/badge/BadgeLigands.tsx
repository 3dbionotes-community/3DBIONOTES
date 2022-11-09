import React from "react";
import styled from "styled-components";
import i18n from "../../../../utils/i18n";
import { Ligand } from "../../../../domain/entities/Covid19Info";
import { IDROptions } from "../Columns";
import { Badge } from "./Badge";
import { useAppContext } from "../../../contexts/app-context";

export type OnClickIDR = (options: IDROptions, gaLabel: string) => void;

export interface BadgeLigandsProps {
    onClick?: OnClickIDR;
    ligand: Ligand;
    moreDetails?: boolean;
}

export const BadgeLigands: React.FC<BadgeLigandsProps> = React.memo(props => {
    const { ligand, onClick, moreDetails = true } = props;
    const { compositionRoot } = useAppContext();

    const notifyClick = React.useCallback(
        e => {
            if (onClick) {
                e.preventDefault();
                compositionRoot.ligands.getIDR.execute(ligand.inChI).run(
                    idr =>
                        onClick(
                            { ligand, idr },
                            `IDR Ligand. ID: ${ligand.id}. Name: ${ligand.name}`
                        ),
                    err =>
                        onClick(
                            { ligand, error: err.message },
                            `ERROR IDR Ligand. ID: ${ligand.id}`
                        )
                );
            }
        },
        [onClick, ligand, compositionRoot]
    );

    return moreDetails ? (
        <BadgeGroup>
            <Badge onClick={notifyClick} backgroundColor={"w3-cyan"}>
                {i18n.t("IDR")} <i className="fa fa-info-circle icon-right"></i>
            </Badge>
        </BadgeGroup>
    ) : (
        <BadgeInlineGroup>
            <Badge onClick={notifyClick} backgroundColor={"w3-cyan"}>
                {i18n.t("IDR")} <i className="fa fa-info-circle icon-right"></i>
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
