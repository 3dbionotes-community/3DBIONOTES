import { Button } from "@material-ui/core";
import styled from "styled-components";
import { getColor } from "../../utils/colors";

export const MainButton = styled(Button)`
    font-size: 18px;
    color: #133546;
    margin: 0px 20px 0 20px;
    padding: 15px 36px;
    border-radius: 100px;
    border: 0px;

    background-color: ${props => getColor(props?.color ?? "primary", "main")};
    text-transform: inherit;
    font-weight: inherit;
    line-height: inherit;

    :hover {
        background-color: #fff;
    }
`;
