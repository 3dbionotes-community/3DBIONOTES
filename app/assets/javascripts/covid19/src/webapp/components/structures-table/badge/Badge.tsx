import styled from "styled-components";
import { W3Color } from "../../../../domain/entities/Covid19Info";

interface BadgeProps {
    color?: W3Color;
    backgroundColor?: W3Color;
    disabled?: boolean;
}

export const Badge = styled.span<BadgeProps>`
    display: inline-flex;
    justify-content: center;
    cursor: ${props => (props.disabled ? "default" : "pointer")};
    padding: 6px 12px;
    flex-grow: 1;
    font-size: 10.5px;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
    margin: 2px;
    white-space: normal;
    color: ${props => (props.color ? colors[props.color] : "#fff")};
    background-color: ${props =>
        props.disabled
            ? "#ccc"
            : props.backgroundColor
            ? colors[props.backgroundColor]
            : "#607d8b"};
    font-weight: 700;
    line-height: 1;
    text-align: center;
    white-space: nowrap;
    vertical-align: baseline;
    border-radius: 0.25rem;
    transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out,
        border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;

    i.icon-right {
        margin-left: 5px;
    }

    i.icon-left {
        margin-right: 5px;
    }
`;

// https://www.w3schools.com/w3css/4/w3.css
export const colors: Record<W3Color, string> = {
    "w3-cyan": "#00bcd4",
    "w3-turq": "#009688",
    "w3-amber": "#ffc107",
    "w3-aqua": "#00ffff",
    "w3-blue": "#2196F3",
    "w3-light-blue": "#87CEEB",
    "w3-brown": "#795548",
    "w3-blue-grey": "#607d8b",
    "w3-green": "#4CAF50",
    "w3-light-green": "#8bc34a",
    "w3-indigo": "#3f51b5",
    "w3-khaki": "#f0e68c",
    "w3-lime": "#cddc39",
    "w3-orange": "#ff9800",
    "w3-deep-orange": "#ff5722",
    "w3-pink": "#e91e63",
    "w3-purple": "#9c27b0",
    "w3-deep-purple": "#673ab7",
    "w3-red": "#f44336",
    "w3-sand": "#fdf5e6",
    "w3-teal": "#009688",
    "w3-yellow": "#ffeb3b",
    "w3-white": "#fff",
    "w3-black": "#000",
    "w3-grey": "#9e9e9e",
    "w3-light-grey": "#f1f1f1",
    "w3-dark-grey": "#616161",
    "w3-pale-red": "#ffdddd",
    "w3-pale-green": "#ddffdd",
    "w3-pale-yellow": "#ffffcc",
    "w3-pale-blue": "#ddffff",
};
