import React, { MouseEvent } from "react";
import styled from "styled-components";
import { Ligand } from "../../../../domain/entities/Covid19Info";
import { IDROptions } from "../Columns";
import { Badge } from "./Badge";
import { useAppContext } from "../../../contexts/app-context";
import i18n from "../../../../utils/i18n";
import { Portal } from "@material-ui/core";
import { LoaderMask } from "../../loader-mask/LoaderMask";
import { useBooleanState } from "../../../hooks/useBoolean";

export type OnClickIDR = (options: IDROptions, gaLabel: string) => void;

export interface BadgeLigandsProps {
    pdbId: string;
    onClick?: OnClickIDR;
    ligand: Ligand;
    moreDetails?: boolean;
}

export const BadgeLigands: React.FC<BadgeLigandsProps> = React.memo(props => {
    const { ligand, pdbId, onClick, moreDetails = true } = props;
    const { compositionRoot } = useAppContext();
    const [loading, { enable: showLoading, disable: hideLoading }] = useBooleanState(false);

    const notifyClick = React.useCallback(
        (e: MouseEvent) => {
            e.preventDefault();
            if (onClick) {
                showLoading();
                compositionRoot.ligands.getIDR
                    .execute(ligand.inChI, pdbId)
                    .tap(() => hideLoading())
                    .run(
                        idr =>
                            onClick(
                                { ligand, pdbId, idr },
                                `IDR Ligand. PDB: ${pdbId}. Ligand: ${ligand.id}. Ligand name: ${ligand.name}`
                            ),
                        err =>
                            onClick(
                                { ligand, pdbId, error: err.message },
                                `ERROR IDR Ligand. ID: ${ligand.id}`
                            )
                    );
            }
        },
        [onClick, ligand, compositionRoot, pdbId, hideLoading, showLoading]
    );

    return (
        <>
            {moreDetails ? (
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
            )}
            <Portal>
                <LoaderMask open={loading} title={i18n.t("Loading IDR...")} />
            </Portal>
        </>
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
