import React, { MouseEvent } from "react";
import styled from "styled-components";
import { Badge } from "./Badge";
import { useAppContext } from "../../../contexts/app-context";
import i18n from "../../../../utils/i18n";
import { NMROptions } from "../Columns";

export type OnClickNMR = (options: NMROptions, gaLabel: string) => void;

export interface BadgeEntitiesProps {
    moreDetails?: boolean;
    onClick?: OnClickNMR;
    uniprotId: string;
    start: number;
    end: number;
}

export const BadgeEntities: React.FC<BadgeEntitiesProps> = React.memo(props => {
    const { moreDetails = true, uniprotId, start, end, onClick } = props;
    const { compositionRoot } = useAppContext();

    const notifyClick = React.useCallback(
        (e: MouseEvent) => {
            e.preventDefault();
            if (onClick) {
                compositionRoot.entities.getNMR.execute(uniprotId, start, end).run(
                    target =>
                        onClick(
                            { target },
                            `NMR Target entity. Uniprot: ${uniprotId}. Start: ${start}. End: ${end}`
                        ),
                    err =>
                        onClick(
                            { error: err.message },
                            `ERROR NMR Target. Uniprot: ${uniprotId}. Start: ${start}. End: ${end}`
                        )
                );
            }
        },
        [onClick, compositionRoot, uniprotId, start, end]
    );

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
