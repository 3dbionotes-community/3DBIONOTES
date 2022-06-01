import React from "react";
import { Button } from "@material-ui/core";
import styled from "styled-components";

interface SearchExampleButtonProps {
    exampleValue: string;
    setValue: (exampleValue: string) => void;
}

export const SearchExampleButton: React.FC<SearchExampleButtonProps> = React.memo(props => {
    const { exampleValue, setValue } = props;
    const setValueExample = React.useCallback(() => setValue(exampleValue), [
        setValue,
        exampleValue,
    ]);
    return (
        <StyledSearchExampleButton onClick={setValueExample}>
            {exampleValue}
        </StyledSearchExampleButton>
    );
});

export const StyledSearchExampleButton = styled(Button)`
    &.MuiButton-root {
        padding: 6px 16px;
        margin: 12px 6px;
        color: #fff;
        font-weight: 500;
        text-transform: unset;
        text-align: center;
        border-radius: 0.75rem;
        background-color: #607d8b;
        border-color: #607d8b;
        font-size: 0.75rem;
        &:focus {
            outline: none;
        }
        &:hover {
            border-color: #82a4b5;
            background-color: #82a4b5;
        }
    }
`;
