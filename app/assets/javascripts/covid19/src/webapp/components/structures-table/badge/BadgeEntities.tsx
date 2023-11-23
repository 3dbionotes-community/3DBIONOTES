import React, { MouseEvent } from "react";
import styled from "styled-components";
import { Badge } from "./Badge";
import { useAppContext } from "../../../contexts/app-context";
import { NMROptions } from "../Columns";
import i18n from "../../../../utils/i18n";

export type OnClickNMR = (options: NMROptions, gaLabel: string) => void;

export interface BadgeEntitiesProps {
    moreDetails?: boolean;
    onClick?: OnClickNMR;
    uniprotId: string;
    start: number;
    end: number;
    setNMROptions: (nmrOptions: NMROptions) => void;
}

export const BadgeEntities: React.FC<BadgeEntitiesProps> = React.memo(props => {
    const { moreDetails = true, uniprotId, start, end, onClick, setNMROptions } = props;
    const getNMR = useNMRPagination(uniprotId, start, end, setNMROptions);

    const notifyClick = React.useCallback(
        (e: MouseEvent) => {
            e.preventDefault();
            if (onClick) return getNMR(uniprotId, start, end, onClick);
        },
        [onClick, uniprotId, start, end, getNMR]
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

function useNMRPagination(
    uniprotId: string,
    start: number,
    end: number,
    setNMROptions: (nmrOptions: NMROptions) => void
) {
    const [page, setPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(25);
    const [count, setCount] = React.useState(0);
    const { compositionRoot } = useAppContext();

    React.useEffect(() => {
        compositionRoot.entities.getNMR
            .execute(uniprotId, start, end, { page, pageSize, count })
            .run(({ target, pagination }) => {
                setCount(pagination.count);
                setNMROptions({
                    target,
                    pagination: { page, pageSize, count: pagination.count },
                    setPagination: {
                        setPage,
                        setPageSize,
                    },
                });
            }, console.error);
    }, [
        page,
        pageSize,
        count,
        setPage,
        setPageSize,
        setNMROptions,
        compositionRoot,
        end,
        start,
        uniprotId,
    ]);

    const getNMR = React.useCallback(
        (uniprotId: string, start: number, end: number, onClick: OnClickNMR) => {
            return compositionRoot.entities.getNMR
                .execute(uniprotId, start, end, { page, pageSize, count })
                .run(
                    ({ target, pagination }) => {
                        setCount(pagination.count);
                        return onClick(
                            {
                                target,
                                pagination: { page, pageSize, count },
                                setPagination: {
                                    setPage,
                                    setPageSize,
                                },
                            },
                            `NMR Target entity. Uniprot: ${uniprotId}. Start: ${start}. End: ${end}`
                        );
                    },
                    err =>
                        onClick(
                            { error: err.message },
                            `ERROR NMR Target. Uniprot: ${uniprotId}. Start: ${start}. End: ${end}`
                        )
                );
        },
        [page, pageSize, count, compositionRoot, setPage, setPageSize]
    );

    return getNMR;
}

const BadgeGroup = styled.div`
    display: flex;
    justify-content: center;
`;

const BadgeInlineGroup = styled.div`
    display: inline-flex;
    align-items: flex-end;
    justify-content: center;
`;
