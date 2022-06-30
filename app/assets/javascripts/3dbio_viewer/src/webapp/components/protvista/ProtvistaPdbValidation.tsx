import React from "react";
import * as d3Module from "d3";
import { ProtvistaPdb, ProtvistaPdbProps } from "./ProtvistaPdb";
import modelQualityStats from "../../../data/repositories/emv_modelquality_stats.json";

declare global {
    const d3: typeof d3Module;
}

const margin = {
    top: 10,
    right: 10,
    bottom: 10,
    left: 20,
};

const dimensions = {
    width: 200 - margin.left - margin.right,
    height: 200 - margin.top - margin.bottom,
};

export const ProtvistaPdbValidation: React.FC<ProtvistaPdbProps> = React.memo(props => {
    const ref = useGrid();

    return (
        <>
            <svg ref={ref} />
            <ProtvistaPdb {...props} />
        </>
    );
});

function useGrid() {
    const svgRef = React.useRef<SVGSVGElement>(null);

    React.useEffect(() => {
        if (!svgRef.current) return;

        let i = 0;
        const numRows = modelQualityStats.graph.axis_y.categories.length;
        const numCols = modelQualityStats.graph.axis_x.categories.length;
        const axisX = modelQualityStats.graph.axis_x.axis_name;
        const axisY = modelQualityStats.graph.axis_y.axis_name;

        const gridData = () => {
            const data: any[] = [];
            const width = 40;
            let height = 40;
            let xPos = 1;
            let yPos = height * numRows;
            for (let row = 0; row < numRows; row++) {
                data.push([]);
                for (let column = 0; column < numCols; column++) {
                    const cellXValue = modelQualityStats.data.categories[i]?.cat_id.split(",")[0];
                    const cellYValue = modelQualityStats.data.categories[i]?.cat_id.split(",")[1];
                    data[row].push({
                        x: xPos,
                        y: yPos,
                        width: width,
                        height: height,
                        value: modelQualityStats.data.categories[i]?.count,
                        color:
                            (cellXValue === "1" || cellXValue === "3") &&
                            (cellYValue === "1" || cellYValue === "2")
                                ? "red"
                                : (cellXValue === "1" || cellXValue === "3") && cellYValue === "3"
                                ? "orange"
                                : cellXValue === "2" && cellYValue === "4"
                                ? "lime"
                                : cellXValue === "2" && cellYValue === "3"
                                ? "greenyellow"
                                : "yellow",
                    });
                    xPos += width;
                    i++;
                }
                if (row === 1) {
                    height = 20;
                } else {
                    height = 40;
                }
                xPos = 1;
                yPos -= height;
            }
            return data;
        };

        const xScale = d3
            .scaleLinear()
            .domain([-3.5, 3.5])
            .range([0, numCols * 40]);
        const xAxis = d3.axisBottom(xScale).tickValues([-1, 1.5]);

        const yScale = d3
            .scaleLinear()
            .domain([-0.65, 1.1])
            .range([numRows * 40, 0]);
        const yAxis = d3.axisLeft(yScale).tickValues([0.25, 0.45]);

        const grid = d3
            .select(svgRef.current)
            .attr("width", dimensions.width + margin.left + margin.right)
            .attr("height", dimensions.height + margin.top + margin.bottom)
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        grid.append("g").attr("transform", "translate(30, 10)").call(yAxis);

        grid.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 20)
            .attr("x", -20)
            .style("text-anchor", "middle")
            .attr("font-size", "0.75em")
            .text(axisY);

        grid.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 25)
            .attr("x", -150)
            .style("text-anchor", "middle")
            .attr("font-size", "0.35em")
            .text("overfitting");

        grid.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 25)
            .attr("x", -110)
            .style("text-anchor", "middle")
            .attr("font-size", "0.35em")
            .text("wrong");

        grid.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 25)
            .attr("x", -45)
            .style("text-anchor", "middle")
            .attr("font-size", "0.35em")
            .text("right");

        grid.append("g")
            .attr("transform", "translate(30, " + dimensions.width + ")")
            .call(xAxis);

        grid.append("text")
            .attr(
                "transform",
                "translate(" + dimensions.width + " ," + (dimensions.height + margin.top) + ")"
            )
            .style("text-anchor", "middle")
            .attr("font-size", "0.75em")
            .text(axisX);

        grid.append("text")
            .attr("transform", "translate(50, " + dimensions.height + ")")
            .style("text-anchor", "middle")
            .attr("font-size", "0.35em")
            .text("overfitting");

        grid.append("text")
            .attr("transform", "translate(90, " + dimensions.height + ")")
            .style("text-anchor", "middle")
            .attr("font-size", "0.35em")
            .text("right");

        grid.append("text")
            .attr("transform", "translate(135, " + dimensions.height + ")")
            .style("text-anchor", "middle")
            .attr("font-size", "0.35em")
            .text("wrong");

        const row = grid
            .append("g")
            .attr("transform", "translate(30, -" + margin.bottom * 3 + ")")
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
            .attr("class", ".cell");

        cell.append("rect")
            .attr("x", (d: any) => d.x)
            .attr("y", (d: any) => d.y)
            .attr("width", (d: any) => d.width)
            .attr("height", (d: any) => d.height)
            .attr("fill", (d: any) => d.color)
            .style("stroke", "#222");

        cell.append("text")
            .attr("x", (d: any) => d.x + 8)
            .attr("y", (d: any) => d.y + 10)
            .attr("font-size", "0.65em")
            .text((d: any) => d.value);
    }, []);

    return svgRef;
}
