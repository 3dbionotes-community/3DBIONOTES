import styled from "styled-components";

export const Container = styled.div`
    .relative {
        position: relative;
        height: 500px;
    }
    margin: 16px 0;
    padding: 32px 64px;
    box-sizing: border-box;
    width: 100vw;
    *::selection {
        background: none;
        color: inherit;
    }
    & > span {
        font-weight: bold;
        font-size: 1.125em;
    }
`;

export const Layer = styled.div`
    position: absolute;
    &.left {
        top: 0;
        left: calc(50% - 700px);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 450px;
    }
    &.right {
        top: 0;
        right: calc(50% - 650px);
        justify-content: left;
        width: 400px;
    }
    &.center {
        top: 0;
        left: calc(50% - 250px);
        justify-content: center;
        span {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 2em;
        }
    }
    img {
        display: block;
        margin-bottom: 20px;
    }
    display: flex;
    align-items: center;
    width: 500px;
    height: 500px;
    &.title {
        font-size: 24px;
        font-family: Lato-Semibold, Lato;
        font-weight: 600;
        text-align: center;
    }
`;

export const SVG = styled.svg`
    z-index: 1;
    path {
        cursor: pointer;
    }
    text {
        font-size: 42px;
    }
    .none {
        fill: none;
        pointer-events: all;
    }
    .orf1a {
        fill: #2c79a8;
        &:hover {
            fill: #3c89b8;
        }
        &:active {
            fill: #4c99c8;
        }
    }
    .orf1b {
        fill: #3692cc;
        &:hover {
            fill: #46a2dc;
        }
        &:active {
            fill: #56b2ec;
        }
    }
    .blue,
    .orf7a {
        fill: #3fa9f5;
        &:hover {
            fill: #4fb9ff;
        }
        &:active {
            fill: #5fc9ff;
        }
    }
    .pink,
    .orf6,
    .orf10 {
        fill: #d93387;
        &:hover {
            fill: #e94397;
        }
        &:active {
            fill: #f953a7;
        }
    }
    .red,
    .orf9b,
    .membrane_protein {
        fill: #ff4322;
        &:hover {
            fill: #ff6342;
        }
        &:active {
            fill: #ff7352;
        }
    }
    .orange,
    .envelope_protein,
    .nucleoprotein {
        fill: #f9c321;
        &:hover {
            fill: #f9d331;
        }
        &:active {
            fill: #f9e341;
        }
    }
    .gray,
    .orf3,
    .orf8 {
        fill: #929292;
        &:hover {
            fill: #a2a2a2;
        }
        &:active {
            fill: #b2b2b2;
        }
    }
    .green,
    .spike,
    .orf7b {
        fill: #60d836;
        &:hover {
            fill: #70e846;
        }
        &:active {
            fill: #80f856;
        }
    }
`;
