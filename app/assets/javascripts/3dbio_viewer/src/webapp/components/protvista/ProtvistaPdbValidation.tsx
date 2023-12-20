import _ from "lodash";
import React from "react";
import * as d3Module from "d3";
import { ProtvistaPdb, ProtvistaPdbProps } from "./ProtvistaPdb";
import { HtmlTooltip } from "../HtmlTooltip";
import { StatsValidation } from "../../../domain/entities/Pdb";
import modelQualityStats from "../../../data/repositories/emv_modelquality_stats.json";
import i18n from "../../utils/i18n";

declare global {
    const d3: typeof d3Module;
}

export const ProtvistaPdbValidation: React.FC<ProtvistaPdbProps> = React.memo(props => {
    const stats = _.first(props.pdb.emdbs)?.emv?.stats;
    const _ref = useGrid(); /*temporal hidden*/

    return (
        <>
            {stats && (
                <div style={styles.svgContainers}>
                    {/* <svg ref={ref} /> */}
                    <SVGBar stats={stats} />
                    <div style={styles.info.container}>
                        {stats.warnings?.map((warning, idx) => (
                            <p key={idx} style={styles.info.warnings}>
                                {warning}
                            </p>
                        ))}
                        {stats.errors?.map((error, idx) => (
                            <p key={idx} style={styles.info.errors}>
                                {error}
                            </p>
                        ))}
                    </div>
                </div>
            )}
            <div>
                <ProtvistaPdb {...props} />
            </div>
        </>
    );
});

interface SVGBarProps {
    stats: StatsValidation;
}

const SVGBar: React.FC<SVGBarProps> = React.memo(({ stats }) => {
    const [open, setOpen] = React.useState(false);
    const [svgWidth, setSvgWidth] = React.useState(0);
    const [anchorEl, setAnchorEl] = React.useState<SVGRectElement | null>(null);

    const hideTooltip = React.useCallback(() => setOpen(false), []);
    const showTooltip = React.useCallback(() => setOpen(true), []);
    const measuredWidth = React.useCallback((el: HTMLDivElement) => {
        if (el !== null) setSvgWidth(el.getBoundingClientRect().width);
    }, []);

    const defineRectEl = React.useCallback((el: SVGRectElement) => {
        if (el !== null) setAnchorEl(el);
    }, []);

    const tooltipContent = React.useMemo(
        () => (
            <p style={styles.tooltip}>
                {`${i18n.t("Quartile-25")}: ${stats.quartile25}`}
                <br />
                {`${i18n.t("Median")}: ${stats.resolutionMedian} ${stats.unit}`}
                <br />
                {`${i18n.t("Quartile-75")}: ${stats.quartile75}`}
            </p>
        ),
        [stats]
    );

    return (
        <div style={styles.bar}>
            {stats.rank && (
                <div ref={measuredWidth}>
                    <div>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox={`0 0 ${svgWidth} 83`}
                            style={styles.svgBar}
                        >
                            <defs>
                                <linearGradient id="barGradient">
                                    <stop stopColor="green" offset={0} />
                                    <stop stopColor="white" offset={0.5} />
                                    <stop stopColor="red" offset={1} />
                                </linearGradient>
                            </defs>
                            <g>
                                <rect
                                    width={svgWidth}
                                    height="35"
                                    x="0"
                                    y="24"
                                    fill="url(#barGradient)"
                                />
                                <rect
                                    width="5"
                                    height="35"
                                    x={(stats.rank / 100) * svgWidth}
                                    y="24"
                                    fill="#000000"
                                    style={styles.rank}
                                    onMouseEnter={showTooltip}
                                    onMouseLeave={hideTooltip}
                                    ref={defineRectEl}
                                />
                                <text x="0" y="79">
                                    {i18n.t("Per 0")}
                                </text>
                                {/*x=52 from 1char is 8px and space is 4px*/}
                                <text x={svgWidth - 52} y="79">
                                    {i18n.t("Per 100")}
                                </text>
                                <text x={(stats.rank / 100) * svgWidth} y="16" textAnchor="middle">
                                    {i18n.t("Rank") + ": " + stats?.rank}
                                </text>
                            </g>
                        </svg>
                    </div>
                    <HtmlTooltip
                        PopperProps={{
                            disablePortal: true,
                            anchorEl: anchorEl,
                        }}
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
        </div>
    );
});

function useGrid() {
    const svgRef = React.useRef<SVGSVGElement>(null);

    React.useEffect(() => {
        if (!svgRef.current) return;

        svgRef.current.innerHTML = ""; //remove all to prevent overlapping

        const { axis_x, axis_y } = modelQualityStats.graph;
        const emvStatsCategories = modelQualityStats.data.categories;
        const numRows = axis_y.categories.length;
        const numCols = axis_x.categories.length;

        const tickValue = (
            axis: typeof modelQualityStats.graph.axis_x | typeof modelQualityStats.graph.axis_y,
            i: number
        ) => {
            return String(axis.categories[i]?.value_range.maximum);
        };

        const cellWidth = 95;
        const cellHeight = 75;

        const gridData = () => {
            let i = 0;
            const data: GridData[][] = [];
            let xPos = 0;
            let yPos = cellHeight * numRows;
            for (let row = 0; row < numRows; row++) {
                data.push([]);
                for (let column = 0; column < numCols; column++) {
                    data[row]?.push({
                        x: xPos,
                        y: yPos,
                        width: cellWidth,
                        height: cellHeight,
                        value: Number(emvStatsCategories[i]?.count),
                        color: String(emvStatsCategories[i]?.color),
                    });
                    xPos += cellWidth;
                    i++;
                }
                xPos = 0;
                yPos -= cellHeight;
            }
            return data;
        };

        const grid = d3
            .select(svgRef.current)
            .attr("width", dimensions.width + 10)
            .attr("height", dimensions.height * 2)
            .append("g");

        const x_axis = grid.append("g");
        const y_axis = grid.append("g");

        x_axis
            .append("line")
            .attr("x1", "20")
            .attr("y1", "375")
            .attr("x2", cellWidth * 3 + 50)
            .attr("y2", "375")
            .attr("stroke", "black");

        x_axis
            .append("text")
            .attr("x", cellWidth + 30)
            .attr("y", "395")
            .attr("font-size", "0.75em")
            .style("text-anchor", "middle")
            .text(tickValue(axis_x, 0));

        x_axis
            .append("text")
            .attr("x", cellWidth * 2 + 30)
            .attr("y", "395")
            .attr("font-size", "0.75em")
            .style("text-anchor", "middle")
            .text(tickValue(axis_x, 1));

        y_axis
            .append("line")
            .attr("x1", "30")
            .attr("y1", "40")
            .attr("x2", "30")
            .attr("y2", cellHeight * 5 + 10)
            .attr("stroke", "black");

        y_axis
            .append("text")
            .attr("x", "20")
            .attr("y", "304")
            .attr("font-size", "0.75em")
            .style("text-anchor", "middle")
            .text(tickValue(axis_y, 0));

        y_axis
            .append("text")
            .attr("x", "15")
            .attr("y", "230")
            .attr("font-size", "0.75em")
            .style("text-anchor", "middle")
            .text(tickValue(axis_y, 1));

        y_axis
            .append("text")
            .attr("x", "15")
            .attr("y", "155")
            .attr("font-size", "0.75em")
            .style("text-anchor", "middle")
            .text(tickValue(axis_y, 2));

        grid.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 35)
            .attr("x", 25)
            .style("text-anchor", "middle")
            .style("font-weight", "700")
            .attr("font-size", "1em")
            .attr("transform", "rotate(90deg)")
            .text(axis_y.axis_name);

        grid.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 25)
            .attr("x", -340)
            .style("text-anchor", "middle")
            .attr("font-size", "0.8em")
            .text("overfitting");

        grid.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 25)
            .attr("x", -265)
            .style("text-anchor", "middle")
            .attr("font-size", "0.9em")
            .text("wrong");

        grid.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 25)
            .attr("x", -110)
            .style("text-anchor", "middle")
            .attr("font-size", "0.9em")
            .text("right");

        grid.append("text")
            .attr("transform", "translate(330, 395)")
            .style("text-anchor", "middle")
            .style("font-weight", "700")
            .attr("font-size", "1em")
            .text(axis_x.axis_name);

        grid.append("text")
            .attr("transform", "translate(80, 395)")
            .style("text-anchor", "middle")
            .attr("font-size", "0.9em")
            .text("overfitting");

        grid.append("text")
            .attr("transform", "translate(175, 395)")
            .style("text-anchor", "middle")
            .attr("font-size", "0.9em")
            .text("right");

        grid.append("text")
            .attr("transform", "translate(270, 395)")
            .style("text-anchor", "middle")
            .attr("font-size", "0.9em")
            .text("wrong");

        const row = grid
            .append("g")
            .attr("transform", "translate(30, 0)")
            .selectAll(".row")
            .data(gridData)
            .enter()
            .append("g")
            .attr("class", "row");

        const cell = row
            .selectAll(".cell")
            .data(d => d)
            .enter()
            .append("g")
            .attr("width", d => d.width)
            .attr("height", d => d.height)
            .attr("onclick", d => "alert(" + d.value + ")")
            .style("cursor", "pointer")
            .attr("class", ".cell");

        cell.append("rect")
            .attr("x", d => d.x)
            .attr("y", d => d.y)
            .attr("width", d => d.width)
            .attr("height", d => d.height)
            .attr("fill", d => d.color)
            .style("stroke", "#222");

        cell.append("text")
            .attr("x", d => d.x + cellWidth / 2)
            .attr("y", d => d.y + cellHeight / 2)
            .attr("font-size", "1.25em")
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "central")
            .text(d => d.value);
    }, []);

    return svgRef;
}

const dimensions = {
    width: 350,
    height: 200,
};

const styles = {
    svgContainers: {
        display: "flex",
        alignItems: "flex-start",
        columnGap: "1em",
    },
    info: {
        container: {
            fontSize: "14px",
            maxWidth: 350,
        },
        warnings: {
            color: "orange",
            border: "3px solid orange",
            borderRadius: "6px",
            padding: "4px 16px",
            fontStyle: "italic",
        },
        errors: {
            color: "orangered",
            border: "3px solid orangered",
            borderRadius: "6px",
            padding: "4px 16px",
            fontStyle: "italic",
        },
    },
    bar: { flexGrow: 1 },
    svgBar: {
        width: "100%",
        height: "100px",
    },
    rank: { cursor: "pointer" },
    tooltip: { margin: 0 },
};

interface GridData {
    color: string;
    height: number;
    width: number;
    value: number;
    x: number;
    y: number;
}
