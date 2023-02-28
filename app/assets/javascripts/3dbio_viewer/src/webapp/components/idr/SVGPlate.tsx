import _ from "lodash";
import React from "react";
import styled from "styled-components";
import { TooltipProps, Typography } from "@material-ui/core";
import { Plate, Well } from "../../../domain/entities/LigandImageData";
import { HtmlTooltip } from "../HtmlTooltip";
import { plateShadowImage } from "./plate-shadow-image";
import i18n from "../../utils/i18n";

interface SVGPlateProps {
    idx: number;
    plate: Plate;
}

export const SVGPlate: React.FC<SVGPlateProps> = React.memo(({ plate, idx }) => {
    const [open, setOpen] = React.useState(false);
    const [anchorEl, setAnchorEl] = React.useState<RefType>();

    const [tooltipTransitioning, setTooltipTransitioning] = React.useState(false);
    const [tooltipContentProps, setTooltipContentProps] = React.useState<TooltipContentProps>();
    const [tooltipPlacement, setTooltipPlacement] = React.useState<TooltipProps["placement"]>();

    const plateRef = React.useRef<SVGGElement>(null);
    const wellRefs = React.useRef<SVGImageElement[]>([]);

    const wells = React.useMemo(
        () => [
            ...plate.wells.map(well => ({ well, type: "well" as const })),
            ...plate.controlWells.map(well => ({ well, type: "control-well" as const })),
        ],
        [plate.controlWells, plate.wells]
    );

    const tooltipContent = React.useMemo(() => <TooltipContent {...tooltipContentProps} />, [
        tooltipContentProps,
    ]);

    const hideTooltip = React.useCallback(() => {
        setOpen(false);
    }, []);

    const showTooltip = React.useCallback(
        (
            ref?: RefType,
            tooltipContentProps?: TooltipContentProps,
            placement?: TooltipProps["placement"]
        ) => {
            setOpen(true);
            setAnchorEl(ref);
            setTooltipContentProps(tooltipContentProps);
            if (placement) setTooltipPlacement(placement);
        },
        []
    );

    const showPlateTooltip = React.useCallback(
        () =>
            !tooltipTransitioning &&
            showTooltip(plateRef.current, { type: "plate", subtitle: plate.name, plate }, "top"),
        [plate, showTooltip, tooltipTransitioning]
    );

    const showWellTooltip = React.useCallback(
        (well: Well, type: "control-well" | "well", idx: number) => () =>
            showTooltip(
                wellRefs.current[idx],
                {
                    type,
                    subtitle: ("ABCDEFGH".charAt(well.position.y) ?? "") + (well.position.x + 1),
                    well,
                },
                "right" //if there is no space for tooltip it will be left as default being "right" set.
            ),
        [showTooltip]
    );

    const triggerTransitioning = React.useCallback(() => {
        setTooltipTransitioning(true);
        setTimeout(() => setTooltipTransitioning(false), 500);
    }, []);

    return (
        <div onMouseLeave={hideTooltip}>
            <StyledSVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 509.28 362.16" idx={idx}>
                <defs>
                    <clipPath xmlns="http://www.w3.org/2000/svg" id={`${idx}-clip-path`}>
                        <ClipPathCircles />
                    </clipPath>
                </defs>
                <PlateBackground ref={plateRef} onMouseEnter={showPlateTooltip} />
                <LeftColumn />
                <TopRow />
                <path className="grid" d={wellsD} />
                <g className="idr-images">
                    {wells.map(({ well, type }, idx) => (
                        <WellWithRef
                            key={well.id}
                            column={well.position.x}
                            row={well.position.y}
                            image={well.image}
                            ref={el => {
                                if (el) wellRefs.current[idx] = el;
                            }}
                            onMouseEnter={showWellTooltip(well, type, idx)}
                            onMouseLeave={triggerTransitioning}
                        />
                    ))}
                </g>
            </StyledSVG>
            <div>
                <HtmlTooltip
                    PopperProps={{
                        disablePortal: true,
                        anchorEl: anchorEl,
                        keepMounted: true,
                    }}
                    onClose={hideTooltip}
                    open={open}
                    disableFocusListener
                    disableHoverListener
                    disableTouchListener
                    title={tooltipContent}
                    placement={tooltipPlacement}
                    interactive
                >
                    <span></span>
                </HtmlTooltip>
            </div>
        </div>
    );
});

interface PlateBackgroundProps {
    tooltipPlacement?: TooltipProps["placement"];
    onMouseEnter: () => void;
}

const PlateBackground = React.forwardRef<SVGGElement | null, PlateBackgroundProps>((props, ref) => {
    return (
        <g ref={ref} onMouseOverCapture={props.onMouseEnter}>
            <image width="2122" height="1509" transform="scale(.24)" xlinkHref={plateShadowImage} />
            <path className="plate-background" d={backgroundPlateD} />
            <path className="fill-b9b9b9" d={outerLineD} />
            <path className="fill-cdcdcd" d={innerLineD} />
        </g>
    );
});

interface WellProps {
    column: number;
    row: number;
    image: string;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
}

const WellWithRef = React.forwardRef<SVGImageElement | null, WellProps>((props, ref) => {
    const { column, row, image, onMouseEnter, onMouseLeave } = props;
    const x = React.useMemo(() => 65.82 + 34 * column, [column]);
    const y = React.useMemo(() => 55.6 + 34 * row, [row]);

    return (
        <image
            x={x}
            y={y}
            width="30"
            height="30"
            xlinkHref={image}
            ref={ref}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        />
    );
});

const tooltipTitles = {
    "control-well": "Control Well",
    well: "Well",
    plate: "Plate",
};

interface TooltipContentProps {
    type?: "control-well" | "well" | "plate";
    subtitle?: string;
    well?: Well;
    plate?: Plate;
}

const TooltipContent: React.FC<TooltipContentProps> = React.memo(props => {
    const { type, subtitle: s, well, plate } = props;

    const title = React.useMemo(() => {
        return type ? tooltipTitles[type] : "";
    }, [type]);

    const subtitle = React.useMemo(() => s && s.charAt(0).toUpperCase() + s.slice(1), [s]);

    return (
        <TooltipContainer>
            <Title>
                <Typography variant="h6">
                    {title}
                    {subtitle && ":"}
                </Typography>
                {subtitle && <span>{subtitle}</span>}
            </Title>
            {plate && (
                <div>
                    <ul>
                        <li>
                            {i18n.t("ID")}: <span>{plate.id}</span>
                        </li>
                    </ul>
                </div>
            )}
            {
                // prettier-ignore
                well && (
                <>
                    <CenterImage>
                        <img width="100px" height="100px" src={well.image} />
                    </CenterImage>
                    <div>
                        <ul>
                            {well.controlType && (<li>{i18n.t("Control type")}: <span>{well.controlType}</span></li>)}
                            <li>{i18n.t("ID")}: <span>{well.id}</span></li>
                            <li>{i18n.t("Cell line")}: <span>{well.cellLine}</span></li>
                            <li>{i18n.t("Cell Line Term Accession")}: <span>{well.cellLineTermAccession}</span></li>
                            <li>{i18n.t("Quality control")}: <span>{well.qualityControl}</span></li>
                            {well.micromolarConcentration && (<li>{i18n.t("Concentration (microMolar)")}: <span>{well.micromolarConcentration}</span></li>)}
                            <li>{i18n.t("Percentage Inhibition")}: <span>{well.percentageInhibition}</span></li>
                            <li>{i18n.t("Hit compound (over 75% activity)")}: <span>{well.hitCompound}</span></li>
                            <li>{i18n.t("Number of Cells (DPC)")}: <span>{well.numberOfCells}</span></li>
                            <li>{i18n.t("Phenotype Annotation Level")}: <span>{well.phenotypeAnnotation}</span></li>
                            <li>{i18n.t("Channels")}: <span>{well.channels}</span></li>
                            <li>{i18n.t("External link")}:{" "}
                                <span>
                                    <a href={well.externalLink} target="_blank" rel="noreferrer">
                                        {well.externalLink}
                                    </a>
                                </span>
                            </li>
                        </ul>
                    </div>
                </>
            )
            }
        </TooltipContainer>
    );
});

const ClipPathCircles: React.FC = React.memo(() => (
    <>
        {_.range(70.6, 342.6, 34).map((y, i) =>
            _.range(80.82, 488.82, 34).map((x, j) => (
                <circle key={`${i}${j}`} cx={x} cy={y} r="15" />
            ))
        )}
    </>
));

const LeftColumn: React.FC = React.memo(
    // prettier-ignore
    () => (
    <text className="left-column">
        <tspan x="35.31" y="79.75">A</tspan>
        <tspan x="35.08" y="113.75">B</tspan>
        <tspan x="34.41" y="147.25">C</tspan>
        <tspan x="34.41" y="181.25">D</tspan>
        <tspan x="35.08" y="215.25">E</tspan>
        <tspan x="34.75" y="248.75">F</tspan>
        <tspan x="32.75" y="282.25">G</tspan>
        <tspan x="34.41" y="316.25">H</tspan>
    </text>
)
);

const TopRow: React.FC = React.memo(() => {
    const y = 42.3;
    // prettier-ignore
    return (
        <text className="top-row">
            <tspan x="75.98" y={y}>1</tspan>
            <tspan x="109.48" y={y}>2</tspan>
            <tspan x="143.48" y={y}>3</tspan>
            <tspan x="176.98" y={y}>4</tspan>
            <tspan x="211.48" y={y}>5</tspan>
            <tspan x="244.98" y={y}>6</tspan>
            <tspan x="278.98" y={y}>7</tspan>
            <tspan x="312.98" y={y}>8</tspan>
            <tspan x="346.48" y={y}>9</tspan>
            <tspan x="376.65" y={y}>10</tspan>
            <tspan x="412.09" y={y}>11</tspan>
            <tspan x="444.15" y={y}>12</tspan>
        </text>
    );
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

type RefType = SVGImageElement | SVGGElement | null;

interface StyledSVGProps {
    idx: number;
}

const StyledSVG = styled.svg<StyledSVGProps>`
    margin-top: 1em;
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
    .idr-images {
        clip-path: url(#${props => props.idx}-clip-path);
    }
    .grid {
        fill: #929292;
    }
`;

const TooltipContainer = styled.div`
    padding: 0.5em;
    font-size: 1.25em;
    max-width: 300px;
    & .MuiTypography-h6 {
        font-size: 1em;
    }
    ul {
        margin: 0;
        padding: 0;
        li {
            list-style: none;
            font-weight: 500;
            line-height: 1.25em;
            span {
                font-weight: 400;
            }
        }
    }
`;

const CenterImage = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 1em 0;
`;

export const Title = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 0.25em;
    span {
        line-height: 1em;
    }
`;
