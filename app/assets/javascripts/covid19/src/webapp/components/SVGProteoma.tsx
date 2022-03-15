import React from "react";
import styled from "styled-components";
import _ from "lodash";
import { HtmlTooltip } from "./structures-table/HtmlTooltip";

export const SVGProteoma: React.FC = React.memo(() => {
    return (
        <SVG
            id="Capa_1"
            data-name="Capa 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1000 1000"
        >
            <TooltipPath
                name=""
                classStyle="cls-7"
                def="M369,230q-11.81,5.75-23,12.46l-51.66-85.64q14.93-9,30.67-16.65Z"
            />
            <TooltipPath
                name=""
                classStyle="cls-2"
                def="M346,242.5q-11.26,6.75-21.85,14.44l-58.92-80.82q14.1-10.25,29.11-19.26Z"
            />
            <TooltipPath
                name=""
                classStyle="cls-3"
                def="M324.14,256.94a295.64,295.64,0,0,0-24.46,19.75l-67-74.21a400.57,400.57,0,0,1,32.57-26.36Z"
            />
            <TooltipPath
                name=""
                classStyle="cls-4"
                def="M299.68,276.69a300.66,300.66,0,0,0-51.09,59.56l-84-54.33a401.58,401.58,0,0,1,68-79.44Z"
            />
            <TooltipPath
                name=""
                classStyle="cls-5"
                def="M248.59,336.25q-7.16,11-13.37,22.6L146.83,312q8.25-15.48,17.8-30.12Z"
            />
            <TooltipPath
                name=""
                classStyle="cls-6"
                def="M235.22,358.85Q229,370.4,223.88,382.53l-92.15-38.92q6.87-16.17,15.1-31.57Z"
            />
            <TooltipPath
                name=""
                classStyle="cls-7"
                def="M223.88,382.53q-5.15,12-9.23,24.61L119.46,376.4q5.43-16.74,12.27-32.79Z"
            />
            <TooltipPath
                name=""
                classStyle="cls-2"
                def="M214.65,407.14a294.64,294.64,0,0,0-8.14,30.46L108.63,417a395.1,395.1,0,0,1,10.83-40.59Z"
            />
            <TooltipPath
                name=""
                classStyle="cls-3"
                def="M206.51,437.6q-2.72,12.76-4.31,25.93l-99.29-12Q105,434,108.63,417Z"
            />
            <TooltipPath
                name=""
                classStyle="cls-4"
                def="M202.2,463.53q-1.57,12.95-2,26.21l-99.95-3.28q.58-17.65,2.68-34.91Z"
            />
            <TooltipPath
                name=""
                classStyle="cls-5"
                def="M82,499a420.89,420.89,0,0,0,4.26,59.88L7.05,570.2a463.25,463.25,0,0,1-4.73-87l79.89,2.62Q82,492.41,82,499Z"
            />
            <TooltipPath
                name=""
                classStyle="cls-5"
                def="M203,542.21l-99,14.15A402.91,402.91,0,0,1,100,500q0-6.79.23-13.54l100,3.28Q200,494.85,200,500A301.33,301.33,0,0,0,203,542.21Z"
            />
            <TooltipPath
                name="Spike"
                classStyle="cls-6"
                def="M227.52,816l-53,61.34C79.25,794.81,24.85,695,7.05,570.2l79.21-11.32A417.31,417.31,0,0,0,227.52,816Z"
            />
            <TooltipPath
                name="Spike"
                classStyle="cls-6"
                def="M304.2,727.3l-65.4,75.64A399.32,399.32,0,0,1,103.94,556.36l99-14.15A299.46,299.46,0,0,0,304.2,727.3Z"
            />
            <TooltipPath
                name="ORF 1ab"
                classStyle="cls-7"
                def="M500,900a398.36,398.36,0,0,1-261.2-97.06l65.4-75.64A298.88,298.88,0,0,0,500,800c165.69,0,300-134.31,300-300S665.92,200.23,500.42,200l-.21-100C721,100.11,900,279.16,900,500S720.91,900,500,900Z"
            />
            <TooltipPath
                classStyle="cls-7"
                name="ORF 1ab"
                def="M1000.08,498.56a502.19,502.19,0,0,1-9.5,98.53q-.6,3-1.24,6.09T988,609.24q-.69,3-1.39,6c-.41,1.72-.82,3.44-1.25,5.16s-.85,3.4-1.29,5.1-.88,3.36-1.33,5-.91,3.32-1.37,5c-59,209.43-251.12,363.1-479.27,363.6-45.14.1-87.78-4.93-128.29-15.21a456.52,456.52,0,0,1-65.65-22.06l-2.11-.89c-46.46-19.9-90.09-47.71-131.6-83.67l53-61.34A416.33,416.33,0,0,0,500,917c230.86,0,418-187.14,418-418S731,81.09,500.17,81L500,.08q18.27,0,36.23,1.22c1.81.12,3.61.26,5.41.41C797.8,22.34,999.52,236.71,1000.08,498.56Z"
            />
            <text className="cls-8" transform="translate(361.76 484.46)">
                <tspan className="cls-9">SARS-CoV-2</tspan>
                <tspan className="cls-13" x="27.64" y="60">
                    Proteome
                </tspan>
            </text>
        </SVG>
    );
});

interface TooltipPathProps {
    name: string;
    classStyle: string;
    def: string;
}

const TooltipPath: React.FC<TooltipPathProps> = React.memo(props => {
    return (
        <HtmlTooltip title={<span>{props.name}</span>}>
            <path className={props.classStyle} d={props.def} transform="translate(-1.99 -0.08)" />
        </HtmlTooltip>
    );
});

const SVG = styled.svg`
    .cls-2 {
        fill: #ff7bac;
    }
    .cls-3 {
        fill: #ff1d25;
    }
    .cls-4 {
        fill: #ff931e;
    }
    .cls-5 {
        fill: #8e999f;
    }
    .cls-6 {
        fill: #7ac943;
    }
    .cls-7 {
        fill: #3fa9f5;
    }
    .cls-8 {
        font-size: 50px;
        font-family: Lato-Bold, Lato;
        font-weight: 700;
    }
    .cls-9 {
        letter-spacing: -0.01em;
    }
    .cls-10 {
        letter-spacing: -0.01em;
    }
    .cls-11 {
        letter-spacing: -0.08em;
    }
    .cls-12 {
        letter-spacing: -0.03em;
    }
    .cls-13 {
        letter-spacing: -0.01em;
    }
    .cls-14 {
        letter-spacing: -0.01em;
    }
    .cls-15 {
        letter-spacing: 0em;
    }
`;
