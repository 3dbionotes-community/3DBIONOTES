import _ from "lodash";
import React from "react";
import * as d3Module from "d3";
import { ProtvistaPdb, ProtvistaPdbProps } from "./ProtvistaPdb";
import modelQualityStats from "../../../data/repositories/emv_modelquality_stats.json";
import localResolutionStats from "../../../data/repositories/emv_localresolution_stats.json";
import { StatsValidation } from "../../../domain/entities/Pdb";

declare global {
    const d3: typeof d3Module;
}

const dimensions = {
    width: 350,
    height: 200,
};

export const ProtvistaPdbValidation: React.FC<ProtvistaPdbProps> = React.memo(props => {
    const emdb = _.first(props.pdb.emdbs);
    const ref = useGrid();
    const svgRef = useBar(emdb?.emv?.stats);

    return (
        <>
            <div style={styles.svgContainers}>
                <svg ref={ref} />
                {svgRef && <svg ref={svgRef} />}
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

function useBar(stats?: StatsValidation) {
    const svgRef = React.useRef<SVGSVGElement>(null);

    React.useEffect(() => {
        if (!svgRef.current) return;
        if (!stats) return;
        const { rank, unit, resolutionMedian, quartile25, quartile75 } = stats;

        const svg = d3
            .select(svgRef.current)
            .attr("width", dimensions.width)
            .attr("height", dimensions.height * 2.5);

        const svgBar = svg.append("g");

        const bar = svgBar
            .append("rect")
            .attr("width", 300)
            .attr("height", dimensions.height / 6)
            .attr("x", "20")
            .attr("y", "90");

        const svgDefs = svgBar.append("defs");
        const mainGradient = svgDefs.append("linearGradient").attr("id", "mainGradient");
        mainGradient.append("stop").attr("stop-color", "red").attr("offset", "0");
        mainGradient.append("stop").attr("stop-color", "white").attr("offset", "0.5");
        mainGradient.append("stop").attr("stop-color", "blue").attr("offset", "1");
        bar.attr("fill", "url(#mainGradient)");

        svgBar
            .append("text")
            .attr("transform", "translate(20, 85)")
            .style("text-anchor", "middle")
            .text("Per 0");

        svgBar
            .append("text")
            .attr("transform", "translate(" + (300 * rank) / 100 + ", 85)")
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

        const rankTooltip = svgBar
            .append("g")
            .attr("class", "rankTooltip")
            .style("display", "none");

        rankTooltip
            .append("rect")
            .attr("width", 170)
            .attr("height", 70)
            .attr("rx", 10)
            .attr("fill-opacity", "0.5")
            .attr("fill", "#000")
            .attr("x", rank + 20)
            .attr("y", 0);

        rankTooltip
            .append("text")
            .text(`Quartile-25: ${quartile25} ${unit}`)
            .attr("x", rank + 30)
            .attr("y", "20")
            .attr("fill", "white");

        rankTooltip
            .append("text")
            .text(`Median: ${resolutionMedian} ${unit}`)
            .attr("x", rank + 30)
            .attr("y", "40")
            .attr("fill", "white");

        rankTooltip
            .append("text")
            .text(`Quartile-75: ${quartile75} ${unit}`)
            .attr("x", rank + 30)
            .attr("y", "60")
            .attr("fill", "white");

        percentileRank.on("mouseover", () => rankTooltip.style("display", "block"));
        percentileRank.on("mouseout", () => rankTooltip.style("display", "none"));

        const svgText = svg
            .append("g")
            .attr("transform", "translate(10, 140)")
            .attr("width", 350)
            .attr("height", dimensions.height * 2);

        svgText
            .append("foreignObject")
            .attr("width", 300)
            .attr("height", dimensions.height * 2)
            .append("xhtml:div")
            .style("font-size", "14px").html(`
                <p>Alias irure aliquam, facilisi taciti tenetur rutrum consequat impedit! Nisl tortor voluptates! Felis scelerisque, anim sollicitudin nostra sem, aliquet doloremque diamlorem magnam provident elit? Nulla lobortis varius omnis tempus asperiores? Ratione omnis, nibh repellat? Netus minima, doloremque veniam dolorem accusamus, porttitor lacus taciti modi senectus? Fugit ut voluptates. Natoque cupidatat.
                <p style="color: orange; border: 3px solid orange; border-radius: 6px; padding: 4px 16px; font-style: italic">${localResolutionStats.warnings.mapping}<p>
                <p style="color: orangered; border: 3px solid orangered; border-radius: 6px; padding: 4px 16px; font-style: italic">${localResolutionStats.errors.processing}<p>
            `);
    }, [stats]);

    return svgRef;
}

const styles = {
    svgContainers: {
        display: "flex",
        alignItems: "center",
        columnGap: "1em",
        marginBottom: "1em",
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
