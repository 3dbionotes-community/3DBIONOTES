import React, { MouseEvent } from "react";
import styled from "styled-components";
import { Badge } from "./Badge";
import { useAppContext } from "../../../contexts/app-context";
import { NMROptions } from "../Columns";
import { SetNMROptions } from "../StructuresTable";
import { LoaderMask } from "../../loader-mask/LoaderMask";
import { useBooleanState } from "../../../hooks/useBoolean";
import i18n from "../../../../utils/i18n";
import { Portal } from "@material-ui/core";

export type OnClickNMR = (options: NMROptions, gaLabel: string) => void;

export interface BadgeEntitiesProps {
    moreDetails?: boolean;
    onClick?: OnClickNMR;
    uniprotId: string;
    start: number;
    end: number;
    setNMROptions: SetNMROptions;
}

export const BadgeEntities: React.FC<BadgeEntitiesProps> = React.memo(props => {
    const { moreDetails = true, uniprotId, start, end, onClick, setNMROptions } = props;
    const [loading, { open: showLoading, close: hideLoading }] = useBooleanState(false);

    const getNMR = useNMRPagination(uniprotId, start, end, setNMROptions);

    const notifyClick = React.useCallback(
        (e: MouseEvent) => {
            e.preventDefault();
            if (onClick) {
                showLoading();
                return getNMR(onClick, hideLoading);
            }
        },
        [onClick, getNMR, hideLoading, showLoading]
    );

    return (
        <>
            {moreDetails ? (
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
            )}
            <Portal>
                <LoaderMask open={loading} title={i18n.t("Loading NMR...")} />
            </Portal>
        </>
    );
});

function useNMRPagination(
    uniprotId: string,
    start: number,
    end: number,
    setNMROptions: SetNMROptions
) {
    const [page, setPage] = React.useState(0);
    const [pageSize, setPageSize] = React.useState(25);
    const [count, setCount] = React.useState(0);
    const { compositionRoot } = useAppContext();

    React.useEffect(() => {
        if (count === 0) return;
        setNMROptions(nmrOptions => ({
            ...nmrOptions,
            loading: true,
        }));

        return compositionRoot.entities.getPartialNMR
            .execute(uniprotId, start, end, { page, pageSize, count })
            .run(
                ({ target, pagination }) => {
                    setCount(pagination.count);
                    return setNMROptions({
                        target,
                        pagination: { page, pageSize, count: pagination.count },
                        setPagination: {
                            setPage,
                            setPageSize,
                        },
                        loading: false,
                    });
                },
                err => {
                    setNMROptions({
                        error: err.message,
                        loading: false,
                    });
                }
            );
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
        (onClick: OnClickNMR, hideLoading: () => void) => {
            return compositionRoot.entities.getPartialNMR
                .execute(uniprotId, start, end, { page, pageSize, count })
                .tap(() => hideLoading())
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
        [page, pageSize, count, compositionRoot, setPage, setPageSize, end, start, uniprotId]
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
