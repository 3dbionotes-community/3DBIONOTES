import React from "react";
import * as d3Module from "d3";
import { ProtvistaPdb, ProtvistaPdbProps } from "./ProtvistaPdb";
import modelQualityStats from "../../../data/repositories/emv_modelquality_stats.json";
import localResolutionStats from "../../../data/repositories/emv_localresolution_stats.json";

declare global {
    const d3: typeof d3Module;
}

const margin = {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20,
};

const dimensions = {
    width: 400,
    height: 200,
};

export const ProtvistaPdbValidation: React.FC<ProtvistaPdbProps> = React.memo(props => {
    const ref = useGrid();
    const svgRef = useBar();

    return (
        <>
            <svg ref={ref} />
            <svg ref={svgRef} />
            <ProtvistaPdb {...props} />
        </>
    );
});

function useGrid() {
    const svgRef = React.useRef<SVGSVGElement>(null);

    React.useEffect(() => {
        if (!svgRef.current) return;

        const numRows = modelQualityStats.graph.axis_y.categories.length;
        const numCols = modelQualityStats.graph.axis_x.categories.length;
        const { axis_x, axis_y } = modelQualityStats.graph;

        const gridData = () => {
            let i = 0;
            const data: gridData[][] = [];
            const width = 60;
            const height = 50;
            let xPos = 1;
            let yPos = height * numRows;
            for (let row = 0; row < numRows; row++) {
                data.push([]);
                for (let column = 0; column < numCols; column++) {
                    data[row]?.push({
                        x: xPos,
                        y: yPos,
                        width: width,
                        height: height,
                        value: Number(modelQualityStats.data.categories[i]?.count),
                        color: String(modelQualityStats.data.categories[i]?.color),
                    });
                    xPos += width;
                    i++;
                }
                xPos = 1;
                yPos -= height;
            }
            return data;
        };

        const xScale = d3
            .scaleLinear()
            .domain([-3.5, 4])
            .range([0, numCols * 50 + 50]);
        const xAxis = d3.axisBottom(xScale).tickValues([-1, 1.5]);

        const yScale = d3
            .scaleLinear()
            .domain([-0.65, 1.1])
            .range([numRows * 50 + 10, 0]);
        const yAxis = d3.axisLeft(yScale).tickValues([0, 0.25, 0.45]);

        const grid = d3
            .select(svgRef.current)
            .attr("width", dimensions.width)
            .attr("height", dimensions.height * 1.25)
            .attr("transform", "translate(" + margin.left * 3 + "," + margin.top + ")");

        grid.append("g").attr("transform", "translate(30, 10)").call(yAxis);

        grid.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 20)
            .attr("x", -20)
            .style("text-anchor", "middle")
            .attr("font-size", "0.75em")
            .text(axis_x.axis_name);

        grid.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 25)
            .attr("x", -195)
            .style("text-anchor", "middle")
            .attr("font-size", "0.5em")
            .text("overfitting");

        grid.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 25)
            .attr("x", -145)
            .style("text-anchor", "middle")
            .attr("font-size", "0.5em")
            .text("wrong");

        grid.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 25)
            .attr("x", -45)
            .style("text-anchor", "middle")
            .attr("font-size", "0.5em")
            .text("right");

        grid.append("g").attr("transform", "translate(30, 220)").call(xAxis);

        grid.append("text")
            .attr(
                "transform",
                "translate(" +
                    (dimensions.width / 2 + margin.right + margin.left) +
                    " ," +
                    (dimensions.height + margin.top + margin.bottom) +
                    ")"
            )
            .style("text-anchor", "middle")
            .attr("font-size", "0.75em")
            .text(axis_y.axis_name);

        grid.append("text")
            .attr("transform", "translate(60, 235)")
            .style("text-anchor", "middle")
            .attr("font-size", "0.7em")
            .text("overfitting");

        grid.append("text")
            .attr("transform", "translate(120, 235)")
            .style("text-anchor", "middle")
            .attr("font-size", "0.7em")
            .text("right");

        grid.append("text")
            .attr("transform", "translate(180, 235)")
            .style("text-anchor", "middle")
            .attr("font-size", "0.7em")
            .text("wrong");

        const row = grid
            .append("g")
            .attr("transform", "translate(30, -30)")
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
            .attr("onclick", d => "alert(" + d.value + ")")
            .attr("x", d => d.x)
            .attr("y", d => d.y)
            .attr("width", d => d.width)
            .attr("height", d => d.height)
            .attr("fill", d => d.color)
            .style("stroke", "#222");

        cell.append("text")
            .attr("x", d => d.x + 8)
            .attr("y", d => d.y + 10)
            .attr("font-size", "0.65em")
            .text(d => d.value);
    }, []);

    return svgRef;
}

function useBar() {
    const svgRef = React.useRef<SVGSVGElement>(null);

    React.useEffect(() => {
        if (!svgRef.current) return;

        const svg = d3
            .select(svgRef.current)
            .attr("width", dimensions.width * 2)
            .attr("height", dimensions.height * 2);

        const svgBar = svg.append("g")

        const bar = svgBar
            .append("rect")
            .attr("width", dimensions.width)
            .attr("height", dimensions.height / 6)
            .attr("x", "20")
            .attr("y", "50");

        const svgDefs = svgBar.append("defs");
        const mainGradient = svgDefs.append("linearGradient").attr("id", "mainGradient");
        mainGradient.append("stop").attr("stop-color", "red").attr("offset", "0");
        mainGradient.append("stop").attr("stop-color", "white").attr("offset", "0.5");
        mainGradient.append("stop").attr("stop-color", "blue").attr("offset", "1");
        bar.attr("fill", "url(#mainGradient)");

        svgBar.append("text")
            .attr("transform", "translate(20, 45)")
            .style("text-anchor", "middle")
            .text("Per 0");

        svgBar.append("text")
            .attr("transform", "translate(" + dimensions.width * 0.25 + ", 45)")
            .style("text-anchor", "middle")
            .text("Per 25");

        svgBar.append("text")
            .attr("transform", "translate(" + dimensions.width * 0.75 + ", 45)")
            .style("text-anchor", "middle")
            .text("Per 75");

        svgBar.append("text")
            .attr("transform", "translate(" + dimensions.width + ", 45)")
            .style("text-anchor", "middle")
            .text("Per 100");

        const percentile25 = svgBar
            .append("rect")
            .attr("width", 5)
            .attr("height", dimensions.height / 6)
            .attr("x", 0.25 * dimensions.width)
            .attr("y", 50);

        const percentile75 = svgBar
            .append("rect")
            .attr("width", 5)
            .attr("height", dimensions.height / 6)
            .attr("x", 0.75 * dimensions.width)
            .attr("y", 50);

        const tooltip25 = svgBar.append("g").attr("class", "tooltip25").style("display", "none");

        tooltip25
            .append("rect")
            .attr("width", 170)
            .attr("height", 30)
            .attr("x", 30)
            .attr("y", 120)
            .attr("fill", "lightGray");

        tooltip25
            .append("line")
            .attr("stroke", "black")
            .attr("x1", 100)
            .attr("x2", 40)
            .attr("y1", 80)
            .attr("y2", 120);

        tooltip25
            .append("line")
            .attr("stroke", "black")
            .attr("x1", 105)
            .attr("x2", 180)
            .attr("y1", 80)
            .attr("y2", 120);

        tooltip25
            .append("text")
            .text("Quartile-25: " + localResolutionStats.data.metrics[1]?.["quartile 25"] + " Å")
            .attr("x", "40")
            .attr("y", "140");

        percentile25.on("mouseover", () => tooltip25.style("display", "block"));
        percentile25.on("mouseout", () => tooltip25.style("display", "none"));

        const tooltip75 = svgBar.append("g").attr("class", "tooltip75").style("display", "none");

        tooltip75
            .append("rect")
            .attr("width", 170)
            .attr("height", 30)
            .attr("x", 210)
            .attr("y", 120)
            .attr("fill", "lightGray");

        tooltip75
            .append("line")
            .attr("stroke", "black")
            .attr("x1", 300)
            .attr("x2", 240)
            .attr("y1", 80)
            .attr("y2", 120);

        tooltip75
            .append("line")
            .attr("stroke", "black")
            .attr("x1", 305)
            .attr("x2", 360)
            .attr("y1", 80)
            .attr("y2", 120);

        tooltip75
            .append("text")
            .text("Quartile-75: " + localResolutionStats.data.metrics[2]?.["quartile 75"] + " Å")
            .attr("x", "220")
            .attr("y", "140");

        percentile75.on("mouseover", () => tooltip75.style("display", "block"));
        percentile75.on("mouseout", () => tooltip75.style("display", "none"));

        const svgText = svg.append("g")
            .attr("transform", "translate(450, 30)")
            .attr("width", 350)
            .attr("height", dimensions.height * 2)

        svgText.append("foreignObject")
            .attr("width", 300)
            .attr("height", dimensions.height * 2)
            .append("xhtml:div")
            .style("font", "14px 'Helvetica Neue'")
            .html(`
                <p>Alias irure aliquam, facilisi taciti tenetur rutrum consequat impedit! Nisl tortor voluptates! Felis scelerisque, anim sollicitudin nostra sem, aliquet doloremque diamlorem magnam provident elit? Nulla lobortis varius omnis tempus asperiores? Ratione omnis, nibh repellat? Netus minima, doloremque veniam dolorem accusamus, porttitor lacus taciti modi senectus? Fugit ut voluptates. Natoque cupidatat.
                <p style="color: orange; border: 3px solid orange; border-radius: 6px; padding: 4px 16px; font-style: italic">${localResolutionStats.warnings.mapping}<p>
                <p style="color: orangered; border: 3px solid orangered; border-radius: 6px; padding: 4px 16px; font-style: italic">${localResolutionStats.errors.processing}<p>
            `)
    }, []);

    return svgRef;
}

interface gridData {
    color: string;
    height: number;
    width: number;
    value: number;
    x: number;
    y: number;
}
