import React from "react";
import { Box, InputBaseComponentProps, TextField, Typography } from "@material-ui/core";
import { CustomGridPagination, CustomGridPaginationProps } from "./CustomGridPagination";
import { Badge } from "./badge/Badge";
import { Maybe } from "../../../data/utils/ts-utils";
import i18n from "../../../utils/i18n";
import styled from "styled-components";

export const Footer: React.FC<CustomGridPaginationProps> = React.memo(props => {
    const { count, pageSize, page, setPage: handlePageChange, isLoading } = props;

    const [inputPage, setInputPage] = React.useState<Maybe<number>>((page ?? 0) + 1);

    const interpolation = {
        pageCount: Math.ceil(count / (pageSize ?? 10)),
    };

    const disabled = isLoading || !inputPage || inputPage === page + 1;

    const inputProps: InputBaseComponentProps = React.useMemo(
        () => ({
            min: 1,
            max: Math.ceil(count / (pageSize ?? 10)),
        }),
        [count, pageSize]
    );

    const onInputChange = React.useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            if (!event.target.value) setInputPage(undefined);
            else
                setInputPage(
                    Math.max(1, Math.min(inputProps.max, parseInt(event.target.value) || 1))
                );
        },
        [inputProps.max]
    );

    const goToPage = React.useCallback(() => {
        if (!disabled && inputPage) handlePageChange(inputPage - 1);
    }, [disabled, handlePageChange, inputPage]);

    const onKeyPress = React.useCallback(
        (event: React.KeyboardEvent) => {
            if (event.key === "Enter") goToPage();
        },
        [goToPage]
    );

    const onInputBlur = React.useCallback(() => {
        if (inputPage === undefined) setInputPage((page ?? 0) + 1);
    }, [inputPage, page]);

    React.useEffect(() => {
        setInputPage((page ?? 0) + 1);
    }, [page]);

    return (
        <Box display="flex" justifyContent="space-between" alignItems="center" paddingX={2}>
            <Box display="flex" alignItems="center" gridColumnGap={"1em"}>
                <Typography variant="body2">{i18n.t("Page")}</Typography>
                <StyledTextField
                    variant="filled"
                    size="small"
                    type="number"
                    color="primary"
                    placeholder={`${inputProps.min}-${inputProps.max}`}
                    inputProps={inputProps}
                    onBlur={onInputBlur}
                    onChange={onInputChange}
                    value={inputPage}
                    length={inputPage?.toString().length}
                    onKeyPress={onKeyPress}
                />
                <Typography variant="body2">{i18n.t("of {{pageCount}}", interpolation)}</Typography>
                <Badge disabled={disabled} backgroundColor="w3-turq" onClick={goToPage}>
                    {i18n.t("Go to page")}
                </Badge>
            </Box>
            <CustomGridPagination {...props} />
        </Box>
    );
});

const StyledTextField = styled(TextField)<{ length?: number; placeholder: string }>`
    .MuiFilledInput-inputMarginDense {
        padding: 0.75em 0.5em;
        min-width: 3em;
        width: ${props => (props.length ? props.length + 2 : props.placeholder.length)}em;
    }
`;
