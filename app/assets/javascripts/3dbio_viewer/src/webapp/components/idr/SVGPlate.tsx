import _ from "lodash";
import React from "react";
import styled from "styled-components";
import { Plate } from "../../../domain/entities/LigandImageData";
import { plateShadowImage } from "./plate-shadow-image";

interface SVGPlateProps {
    plate: Plate;
}

export const SVGPlate: React.FC<SVGPlateProps> = React.memo(({ plate }) => {
    return (
        <StyledSVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 509.28 362.16">
            <defs>
                <clipPath xmlns="http://www.w3.org/2000/svg" id="clippath">
                    {_.range(70.6, 342.6, 34).map((y, i) =>
                        _.range(80.82, 488.82, 34).map((x, j) => (
                            <circle key={`${i}${j}`} cx={x} cy={y} r="15" />
                        ))
                    )}
                </clipPath>
            </defs>
            <PlateBackground />
            <LeftColumn />
            <TopRow />
            <g id="Wells">
                <path className="grid" d={wellsD} />
            </g>
            <g id="images" className="clip-path">
                {plate.wells.map(well => (
                    <Well
                        key={well.id}
                        x={well.position.x}
                        y={well.position.y}
                        image={well.image}
                    />
                ))}
                {plate.controlWells.map(well => (
                    <Well
                        key={well.id}
                        x={well.position.x}
                        y={well.position.y}
                        image={well.image}
                    />
                ))}
            </g>
        </StyledSVG>
    );
});

const PlateBackground: React.FC = React.memo(() => (
    <>
        <image width="2122" height="1509" transform="scale(.24)" xlinkHref={plateShadowImage} />
        <path className="plate-background" d={backgroundPlateD} />
        <path className="fill-b9b9b9" d={outerLineD} />
        <path className="fill-cdcdcd" d={innerLineD} />
    </>
));

const LeftColumn: React.FC = React.memo(() => (
    <text className="left-column">
        <tspan x="35.31" y="79.75">
            A
        </tspan>
        <tspan x="35.08" y="113.75">
            B
        </tspan>
        <tspan x="34.41" y="147.25">
            C
        </tspan>
        <tspan x="34.41" y="181.25">
            D
        </tspan>
        <tspan x="35.08" y="215.25">
            E
        </tspan>
        <tspan x="34.75" y="248.75">
            F
        </tspan>
        <tspan x="32.75" y="282.25">
            G
        </tspan>
        <tspan x="34.41" y="316.25">
            H
        </tspan>
    </text>
));

const TopRow: React.FC = React.memo(() => (
    <text className="top-row">
        <tspan x="75.98" y="42.3">
            1
        </tspan>
        <tspan x="109.48" y="42.3">
            2
        </tspan>
        <tspan x="143.48" y="42.3">
            3
        </tspan>
        <tspan x="176.98" y="42.3">
            4
        </tspan>
        <tspan x="211.48" y="42.3">
            5
        </tspan>
        <tspan x="244.98" y="42.3">
            6
        </tspan>
        <tspan x="278.98" y="42.3">
            7
        </tspan>
        <tspan x="312.98" y="42.3">
            8
        </tspan>
        <tspan x="346.48" y="42.3">
            9
        </tspan>
        <tspan x="376.65" y="42.3">
            10
        </tspan>
        <tspan x="412.09" y="42.3">
            11
        </tspan>
        <tspan x="444.15" y="42.3">
            12
        </tspan>
    </text>
));

interface WellProps {
    x: number;
    y: number;
    image: string;
}

const Well: React.FC<WellProps> = React.memo(props => {
    const x = React.useMemo(() => 65.82 + 34 * props.x, [props.x]);
    const y = React.useMemo(() => 55.6 + 34 * props.y, [props.y]);

    return <image x={x} y={y} width="30" height="30" xlinkHref={props.image} />;
});

//viewBox const for readability = 0 0 509.28 362.16

const backgroundPlateD =
    "M33.36,351.19l-.18-.1c-1.31-.71-2.51-1.61-3.56-2.66l-13.49-13.49c-.62-.62-1.18-1.28-1.68-1.99l-2.48-3.48c-1.88-2.65-2.89-5.81-2.89-9.06V40.78c0-2.61,.65-5.18,1.9-7.47h0c.72-1.32,1.62-2.52,2.68-3.58l13.46-13.46c.63-.63,1.3-1.2,2.03-1.71l3.67-2.59c2.64-1.87,5.79-2.87,9.02-2.87H483.07s17,.5,17,15V338.1s-.25,15-17,15H40.85c-2.62,0-5.19-.66-7.49-1.91Z";
const outerLineD =
    "M480.32,24.6h0c.41,0,4,.15,4,4V333.6c0,.41-.15,4-4,4H43.73l-18.41-18.41V43.01l18.41-18.41H480.32m0-1H43.32l-19,19V319.6l19,19H480.32c5,0,5-5,5-5V28.6c0-5-5-5-5-5h0Z";
const innerLineD =
    "M469.32,52.1c4.82,0,5,4.49,5,5V322.1c0,.51-.18,5-5,5H66.32c-4.82,0-5-4.49-5-5V57.1c0-.51,.18-5,5-5H469.32m0-1H66.32c-6,0-6,6-6,6V322.1s0,6,6,6H469.32c6,0,6-6,6-6V57.1s0-6-6-6h0Z";

const circ = "c8.27,0,15,6.73,15,15s-6.73,15-15,15-15-6.73-15-15,6.73-15,15-15";
const innerCirc = "m0-1c-8.84,0-16,7.16-16,16s7.16,16,16,16,16-7.16,16-16-7.16-16-16-16h0Z";
const cell = `${circ}${innerCirc}`;

const row = _.range(12)
    .map(() => cell)
    .join("m34,1");

const wellsD =
    "M80.82,55.6" +
    _.range(8)
        .map(() => row)
        .join("m-374,35");

const StyledSVG = styled.svg`
    .plate-background {
        fill: #fff;
    }
    .top-row {
        font-size: 12px;
    }
    .left-column {
        font-size: 24px;
    }
    .top-row,
    .left-column {
        font-family: ArialMT, Arial;
    }
    .fill-cdcdcd {
        fill: #cdcdcd;
    }
    .fill-b9b9b9 {
        fill: #b9b9b9;
    }
    .clip-path {
        clip-path: url(#clippath);
    }
    .grid {
        fill: #929292;
    }
`;
