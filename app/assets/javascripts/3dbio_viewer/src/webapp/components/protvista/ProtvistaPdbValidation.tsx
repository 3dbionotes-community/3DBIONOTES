import * as d3Module from "d3";
import _ from "lodash";
import React from "react";
import { ProtvistaPdb, ProtvistaPdbProps } from "./ProtvistaPdb";
import { StatsValidation } from "../../../domain/entities/Pdb";
import { HtmlTooltip } from "../HtmlTooltip";
import modelQualityStats from "../../../data/repositories/emv_modelquality_stats.json";
import i18n from "../../utils/i18n";

declare global {
    const d3: typeof d3Module;
}

const dimensions = {
    width: 350,
    height: 200,
};

export const ProtvistaPdbValidation: React.FC<ProtvistaPdbProps> = React.memo(props => {
    const emdb = _.first(props.pdb.emdbs);
    const _ref = useGrid(); /*temporal hidden*/
    const stats = emdb?.emv?.stats;

    const [open, setOpen] = React.useState(false);
    const [anchorEl, setAnchorEl] = React.useState<SVGRectElement | null>(null);
    const containerRef = React.useRef<HTMLDivElement | null>(null);

    const svgWidth = React.useMemo(() => containerRef.current?.getBoundingClientRect().width ?? 0, [
        containerRef.current,
    ]);

    const displayTooltipStyle = React.useMemo(() => (open ? {} : { display: "none" }), [open]);
    const tooltipContent = React.useMemo(
        () =>
            (stats && (
                <p>
                    {`${i18n.t("Quartile-25")}: ${stats.quartile25}`}
                    {`${i18n.t("Median")}: ${stats.resolutionMedian} ${stats.unit}`}
                    {`${i18n.t("Quartile-75")}: ${stats.quartile75}`}
                </p>
            )) ||
            "",
        []
    );

    const hideTooltip = React.useCallback(() => {
        setOpen(false);
    }, []);

    const showTooltip = React.useCallback(() => {
        setOpen(true);
        setAnchorEl(anchorEl);
    }, [anchorEl]);

    const svgRef = useBar(showTooltip, hideTooltip, emdb?.emv?.stats);

    return (
        <>
            <div style={displayTooltipStyle}>
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
                    placement={"top"}
                >
                    <span></span>
                </HtmlTooltip>
            </div>
            <div style={styles.svgContainers}>
                {/* <svg ref={ref} /> */}
                {svgRef && (
                    <div ref={containerRef} style={{ width: "100%" }}>
                        <svg ref={svgRef} />
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
                                    ></rect>
                                    <text x="0" y="79">
                                        {i18n.t("Per 0")}
                                    </text>
                                    {/*x=52 from 1char is 8px and space is 4px*/}
                                    <text x={svgWidth - 52} y="79">
                                        {i18n.t("Per 100")}
                                    </text>
                                    <text x="0" y="16">
                                        {i18n.t("Rank") + ": " + stats?.rank}
                                    </text>
                                </g>
                            </svg>
                        </div>
                        <div style={styles.info.container}>
                            {emdb?.emv?.stats?.warnings?.map((warning, idx) => (
                                <p key={idx} style={styles.info.warnings}>
                                    {warning}
                                </p>
                            ))}
                            {emdb?.emv?.stats?.errors?.map((error, idx) => (
                                <p key={idx} style={styles.info.errors}>
                                    {error}
                                </p>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <div>
                <ProtvistaPdb {...props} />
            </div>
        </>
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

function useBar(showTooltip: () => void, hideTooltip: () => void, stats?: StatsValidation) {
    const svgRef = React.useRef<SVGSVGElement>(null);

    React.useEffect(() => {
        if (!svgRef.current) return;
        if (!stats) return;
        const { rank, resolutionMedian, unit, quartile25, quartile75 } = stats;

        svgRef.current.innerHTML = ""; //remove all to prevent overlapping

        const svg = d3.select(svgRef.current).attr("width", dimensions.width).attr("height", 150);

        const svgBar = svg.append("g");

        const bar = svgBar
            .append("rect")
            .attr("width", 300)
            .attr("height", dimensions.height / 6)
            .attr("x", "20")
            .attr("y", "90");

        const svgDefs = svgBar.append("defs");
        const mainGradient = svgDefs.append("linearGradient").attr("id", "mainGradient");
        mainGradient.append("stop").attr("stop-color", "green").attr("offset", "0");
        mainGradient.append("stop").attr("stop-color", "white").attr("offset", "0.5");
        mainGradient.append("stop").attr("stop-color", "red").attr("offset", "1");
        bar.attr("fill", "url(#mainGradient)");

        svgBar
            .append("text")
            .attr("transform", "translate(20, 85)")
            .style("text-anchor", "middle")
            .text("Per 0");

        svgBar
            .append("text")
            .attr("transform", "translate(" + (300 * rank) / 100 + ", 145)")
            .style("text-anchor", "middle")
            .text("Rank: " + rank);

        svgBar
            .append("text")
            .attr("transform", "translate(" + 300 + ", 85)")
            .style("text-anchor", "middle")
            .text("Per 100");

        const percentileRank = svgBar
            .append("rect")
            .attr("width", 5)
            .attr("height", dimensions.height / 6)
            .attr("x", (rank / 100) * 300)
            .attr("y", 90)
            .style("cursor", "pointer");

        percentileRank.on("mouseover", () => showTooltip());
        percentileRank.on("mouseout", () => hideTooltip());
    }, [stats]);

    return svgRef;
}

const styles = {
    svgContainers: {
        display: "flex",
        alignItems: "flex-start",
        columnGap: "1em",
        marginBottom: "1em",
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
    svgBar: {
        width: "100%",
        height: "100px",
    },
};

interface GridData {
    color: string;
    height: number;
    width: number;
    value: number;
    x: number;
    y: number;
}
