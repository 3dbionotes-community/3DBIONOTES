import styled from "styled-components";

export const ModalTitle = styled.span<{ big?: boolean }>`
    font-weight: 300;
    font-size: ${props => (props.big ? "48px" : "36px")};
    line-height: ${props => (props.big ? "60px" : "47px")};
    margin: ${props => (props.big ? "30px" : "0px")} 0px 30px 0px;
`;
