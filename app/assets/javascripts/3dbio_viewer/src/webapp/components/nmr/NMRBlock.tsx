import _ from "lodash";
import React from "react";
import { BlockComponentProps } from "../protvista/Protvista.types";
import { Maybe, recordOfStyles } from "../../../utils/ts-utils";
import i18n from "../../utils/i18n";
import { HtmlTooltip } from "../HtmlTooltip";

const ratiosHardcode = [
    {
        ratio: 0.0049833887,
        total: 602,
    },
    {
        ratio: 0.049833887,
        total: 602,
    },
    {
        ratio: 0.0199335548,
        total: 602,
    },
    {
        ratio: 0.1,
        total: 602,
    },
];

const ligandsHardcode = [
    {
        name: "string",
        smiles: "string",
        inchiKey: "string",
        formula: "string",
        pubchem_id: 3,
        target: "string",
        binding: true,
    },
];

const svgProps = {
    //calculated lineHeight is 16px (fontSize 1rem)
    barHeight: 50,
    columnGap: 7.5,
    rowGap: 15,
    topSpace: 24,
    topBarMargin: 100,
    leftSpace: 24,
    bottomSpace: 24,
};

export const NMRBlock: React.FC<BlockComponentProps> = React.memo(
    ({ pdb, block, setBlockVisibility }) => {
        const { barHeight, topSpace, leftSpace, bottomSpace, topBarMargin } = svgProps;

        const [svgWidth, setSvgWidth] = React.useState(100);
        const [open, setOpen] = React.useState(false);
        const [index, setIndex] = React.useState<Maybe<number>>(undefined);
        const [anchorEl, setAnchorEl] = React.useState<SVGTextElement | null>(null);

        const hideTooltip = React.useCallback(() => setOpen(false), []);
        const showTooltip = React.useCallback((idx: number) => {
            setOpen(true);
            setIndex(idx);
        }, []);

        const measuredWidth = React.useCallback((el: HTMLDivElement) => {
            if (el !== null) setSvgWidth(el.getBoundingClientRect().width);
        }, []);

        const ratiosRef = React.useMemo(
            () =>
                ratiosHardcode.map(ratio => ({
                    ratio,
                    ref: (idx: number) =>
                        open && idx === index
                            ? (el: SVGTextElement) => {
                                  if (el !== null) setAnchorEl(el);
                              }
                            : null,
                })),
            [open, index]
        );

        const height = React.useMemo(
            () => ratiosHardcode.length * (barHeight + 15) + topSpace + bottomSpace + topBarMargin,
            [barHeight, topSpace, bottomSpace, topBarMargin]
        );

        const borders = React.useMemo(
            () => `M${leftSpace},${topSpace}V${height}M0,${height - bottomSpace}H${svgWidth}`,
            [leftSpace, topSpace, height, svgWidth, bottomSpace]
        );

        const tooltipContent = React.useMemo(
            () => <TooltipContent ligands={ligandsHardcode} />,
            []
        );

        // React.useEffect(() => {
        //     if (true && setBlockVisibility) {
        //         setBlockVisibility({ block, visible: true });
        //     }
        // }, [setBlockVisibility, block]);

        return (
            <>
                {true && (
                    <div style={styles.container}>
                        <div ref={measuredWidth} style={styles.svgContainer}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox={`0 0 ${svgWidth + 1} ${height}`} //svgWidth + 1 because right stroke is on the middle of the pixel
                                width={svgWidth + 1}
                                height={height}
                            >
                                <text x="0" y="16" fontWeight={700}>
                                    {i18n.t("Target")}
                                </text>
                                <text
                                    x={svgWidth / 2}
                                    y={height}
                                    fontWeight={700}
                                    textAnchor="middle"
                                >
                                    {i18n.t("Number of Ligands")}
                                </text>
                                {ratiosRef.map(({ ratio: r, ref }, idx) => {
                                    return (
                                        <RatioBar
                                            key={idx}
                                            idx={idx}
                                            ratio={r.ratio}
                                            total={r.total}
                                            width={svgWidth}
                                            title={"NSP" + idx}
                                            ref={ref(idx)}
                                            showTooltip={() => showTooltip(idx)}
                                            hideTooltip={hideTooltip}
                                        />
                                    );
                                })}
                                <path d={borders} stroke="#000" strokeWidth={1} />
                            </svg>
                        </div>
                        <p style={styles.p}>
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Asperiores rem,
                            at sapiente eius accusamus ab, fuga repudiandae recusandae nihil libero
                            laborum nostrum delectus fugit dignissimos! Quos, sed? Nihil,
                            perspiciatis soluta?
                        </p>
                        <HtmlTooltip
                            PopperProps={{ anchorEl }}
                            onClose={hideTooltip}
                            open={open}
                            disableFocusListener
                            disableHoverListener
                            disableTouchListener
                            title={tooltipContent}
                            placement={"top"}
                        >
                            <span></span>
                        </HtmlTooltip>
                    </div>
                )}
            </>
        );
    }
);

interface RatioBarProps {
    idx: number;
    ratio: number;
    total: number;
    width: number;
    title: string;
    showTooltip: () => void;
    hideTooltip: () => void;
}

const RatioBar = React.forwardRef<SVGGElement | null, RatioBarProps>((props, ref) => {
    const { idx, ratio, total, width, title, showTooltip, hideTooltip } = props;
    const { barHeight, columnGap, rowGap, leftSpace, topSpace, topBarMargin } = svgProps;

    const availableWidth = React.useMemo(() => width - leftSpace, [width, leftSpace]);

    const leftBar = React.useMemo(
        () => ({
            x: leftSpace, // absolute from left line,
            y: topBarMargin + topSpace + idx * (barHeight + rowGap),
            width: availableWidth * ratio,
            height: barHeight,
            fill: "#92e000",
        }),
        [availableWidth, ratio, idx, rowGap, barHeight, topSpace, leftSpace, topBarMargin]
    );

    // https://stackoverflow.com/questions/75321458/vertically-centering-a-text-element-inside-a-rect-element
    const leftBarText = React.useMemo(
        () => ({
            x: leftBar.width / 2 + leftBar.x,
            y: leftBar.height / 2 + leftBar.y,
            value: Math.round(ratio * total).toString(),
        }),
        [leftBar, ratio, total]
    );

    const rightBar = React.useMemo(
        () => ({
            x: leftBar.x + leftBar.width + columnGap,
            y: leftBar.y,
            width: availableWidth * (1 - ratio) - columnGap,
            height: barHeight,
            fill: "#b7121f",
        }),
        [leftBar, ratio, columnGap, availableWidth, barHeight]
    );

    const rightBarText = React.useMemo(
        () => ({
            x: rightBar.width / 2 + rightBar.x,
            y: rightBar.height / 2 + rightBar.y,
            value: Math.round((1 - ratio) * total).toString(),
        }),
        [rightBar, ratio, total]
    );

    return (
        <g ref={ref} onMouseEnter={showTooltip} onMouseLeave={hideTooltip}>
            {ratio !== 0 && <Bar bar={leftBar} text={leftBarText} />}
            {ratio !== 1 && <Bar bar={rightBar} text={rightBarText} />}
            <text
                textAnchor="middle"
                transform={`translate(16,${leftBarText.y}) rotate(-90)`} // is a must for rotation purposes. Rotate attr does it for each glyph individually
            >
                {title}
            </text>
        </g>
    );
});

interface BarProps {
    bar: {
        x: number;
        y: number;
        width: number;
        height: number;
        fill: string;
    };
    text: {
        x: number;
        y: number;
        value: string;
    };
}

const Bar: React.FC<BarProps> = React.memo(({ bar, text: { x, y, value } }) => (
    <g>
        <rect {...bar} stroke="#000" strokeWidth={1} />
        <text {...{ x, y }} textAnchor="middle" alignmentBaseline="central">
            {value}
        </text>
    </g>
));

interface TooltipContentProps {
    ligands: {
        name: string;
        smiles: string;
        inchiKey: string;
        formula: string;
        pubchem_id: number;
        target: string;
        binding: boolean;
    }[];
}

const TooltipContent: React.FC<TooltipContentProps> = React.memo(({ ligands }) => {
    return <p>c</p>;
});

const styles = recordOfStyles({
    container: {
        display: "flex",
        columnGap: "2em",
        marginTop: "1em",
        alignItems: "center",
        maxHeight: 700,
        overflowY: "auto",
    },
    svgContainer: {
        flexGrow: 1,
    },
    p: { flex: "0 1 300px" },
});
