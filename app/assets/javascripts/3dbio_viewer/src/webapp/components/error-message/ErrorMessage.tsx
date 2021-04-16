import React from "react";
import styled from "styled-components";

export const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
    <Message>{message}</Message>
);

const Message = styled.p`
    font-size: 0.9em;
    color: red;
`;
