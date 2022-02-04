import React from "react";
import { Button } from "@material-ui/core";
import styled from "styled-components";

interface SearchExampleButtonProps {
    exampleValue: string;
    setValue: (exampleValue: string) => void;
}

export const SearchExampleButton: React.FC<SearchExampleButtonProps> = React.memo(props => {
    const { exampleValue, setValue } = props;

    return (
        <StyledSearchExampleButton
            variant="contained"
            size="small"
            onClick={() => setValue(exampleValue)}
        >
            {exampleValue}
        </StyledSearchExampleButton>
    );
});

const StyledSearchExampleButton = styled(Button)`
    &.MuiButton-root {
        padding: 6px 12px;
        margin: 12px 6px;
        color: #fff;
        font-weight: 700;
        text-align: center;
        border-radius: 0.25rem;
        background-color: #607d8b;
        border-color: #607d8b;
        font-size: 11px;
        &:focus {
            outline: none;
        }
        &:hover {
            border-color: #82a4b5;
            background-color: #82a4b5;
        }
    }
`;
