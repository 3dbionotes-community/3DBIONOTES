import React from "react";
import * as d3Module from "d3";
import { ProtvistaPdb, ProtvistaPdbProps } from "./ProtvistaPdb";
import modelQualityStats from "../../../data/repositories/emv_modelquality_stats.json";
import localResolutionStats from "../../../data/repositories/emv_localresolution_stats.json";
import _ from "lodash";

declare global {
    const d3: typeof d3Module;
}

const dimensions = {
    width: 350,
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

        const gridData = () => {
            let i = 0;
            const data: GridData[][] = [];
            const width = 80;
            const height = 60;
            let xPos = 0;
            let yPos = height * numRows;
            for (let row = 0; row < numRows; row++) {
                data.push([]);
                for (let column = 0; column < numCols; column++) {
                    data[row]?.push({
                        x: xPos,
                        y: yPos,
                        width: width,
                        height: height,
                        value: Number(emvStatsCategories[i]?.count),
                        color: String(emvStatsCategories[i]?.color),
                    });
                    xPos += width;
                    i++;
                }
                xPos = 0;
                yPos -= height;
            }
            return data;
        };

        const grid = d3
            .select(svgRef.current)
            .attr("width", dimensions.width)
            .attr("height", dimensions.height * 2)
            .attr("transform", "translate(0, -80)")
            .append("g");

        const x_axis = grid.append("g");
        const y_axis = grid.append("g");

        x_axis
            .append("line")
            .attr("x1", "20")
            .attr("y1", "300")
            .attr("x2", "290")
            .attr("y2", "300")
            .attr("stroke", "black");

        x_axis
            .append("text")
            .attr("x", "110")
            .attr("y", "320")
            .attr("font-size", "0.75em")
            .style("text-anchor", "middle")
            .text(tickValue(axis_x, 0));

        x_axis
            .append("text")
            .attr("x", "190")
            .attr("y", "320")
            .attr("font-size", "0.75em")
            .style("text-anchor", "middle")
            .text(tickValue(axis_x, 1));

        y_axis
            .append("line")
            .attr("x1", "30")
            .attr("y1", "40")
            .attr("x2", "30")
            .attr("y2", "310")
            .attr("stroke", "black");

        y_axis
            .append("text")
            .attr("x", "20")
            .attr("y", "242")
            .attr("font-size", "0.75em")
            .style("text-anchor", "middle")
            .text(tickValue(axis_y, 0));

        y_axis
            .append("text")
            .attr("x", "15")
            .attr("y", "185")
            .attr("font-size", "0.75em")
            .style("text-anchor", "middle")
            .text(tickValue(axis_y, 1));

        y_axis
            .append("text")
            .attr("x", "15")
            .attr("y", "125")
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
            .attr("x", -270)
            .style("text-anchor", "middle")
            .attr("font-size", "0.65em")
            .text("overfitting");

        grid.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 25)
            .attr("x", -210)
            .style("text-anchor", "middle")
            .attr("font-size", "0.7em")
            .text("wrong");

        grid.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 25)
            .attr("x", -90)
            .style("text-anchor", "middle")
            .attr("font-size", "0.7em")
            .text("right");

        grid.append("text")
            .attr("transform", "translate(290, 320)")
            .style("text-anchor", "middle")
            .style("font-weight", "700")
            .attr("font-size", "1em")
            .text(axis_x.axis_name);

        grid.append("text")
            .attr("transform", "translate(70, 320)")
            .style("text-anchor", "middle")
            .attr("font-size", "0.7em")
            .text("overfitting");

        grid.append("text")
            .attr("transform", "translate(150, 320)")
            .style("text-anchor", "middle")
            .attr("font-size", "0.7em")
            .text("right");

        grid.append("text")
            .attr("transform", "translate(230, 320)")
            .style("text-anchor", "middle")
            .attr("font-size", "0.7em")
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
            .attr("x", d => d.x + 40)
            .attr("y", d => d.y + 30)
            .attr("font-size", "0.65em")
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "central")
            .text(d => d.value);
    }, []);

    return svgRef;
}

function useBar() {
    const svgRef = React.useRef<SVGSVGElement>(null);

    React.useEffect(() => {
        if (!svgRef.current) return;

        type Metrics = Partial<Record<"resolution Median" | "quartile 25" | "quartile 75", number>>;

        const metrics = _.reduce(
            localResolutionStats.data.metrics,
            (acc, metric) => _.merge(acc, metric),
            {} as Metrics
        );

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
            .attr("y", "50");

        const svgDefs = svgBar.append("defs");
        const mainGradient = svgDefs.append("linearGradient").attr("id", "mainGradient");
        mainGradient.append("stop").attr("stop-color", "red").attr("offset", "0");
        mainGradient.append("stop").attr("stop-color", "white").attr("offset", "0.5");
        mainGradient.append("stop").attr("stop-color", "blue").attr("offset", "1");
        bar.attr("fill", "url(#mainGradient)");

        svgBar
            .append("text")
            .attr("transform", "translate(20, 45)")
            .style("text-anchor", "middle")
            .text("Per 0");

        svgBar
            .append("text")
            .attr("transform", "translate(" + 300 * 0.25 + ", 45)")
            .style("text-anchor", "middle")
            .text("Per 25");

        svgBar
            .append("text")
            .attr("transform", "translate(" + 300 * 0.75 + ", 45)")
            .style("text-anchor", "middle")
            .text("Per 75");

        svgBar
            .append("text")
            .attr("transform", "translate(" + 300 + ", 45)")
            .style("text-anchor", "middle")
            .text("Per 100");

        const percentile25 = svgBar
            .append("rect")
            .attr("width", 5)
            .attr("height", dimensions.height / 6)
            .attr("x", 0.25 * 300)
            .attr("y", 50)
            .style("cursor", "pointer");

        const percentile75 = svgBar
            .append("rect")
            .attr("width", 5)
            .attr("height", dimensions.height / 6)
            .attr("x", 0.75 * 300)
            .attr("stroke", "black")
            .attr("stroke-width", 2)
            .attr("fill", "none")
            .attr("y", 50)
            .style("cursor", "pointer");

        const tooltip25 = svgBar.append("g").attr("class", "tooltip25").style("display", "none");

        tooltip25
            .append("rect")
            .attr("width", 170)
            .attr("height", 70)
            .attr("x", 10)
            .attr("y", 100)
            .attr("fill", "lightGray");

        tooltip25
            .append("text")
            .text(`Quartile-25: ${metrics["quartile 25"] ?? "-"}  Å`)
            .attr("x", "20")
            .attr("y", "120");

        tooltip25
            .append("text")
            .text(`Median: ${metrics["resolution Median"] ?? "-"}  Å`)
            .attr("x", "20")
            .attr("y", "140");

        tooltip25
            .append("text")
            .text(`Quartile-75: ${metrics["quartile 75"] ?? "-"}  Å`)
            .attr("x", "20")
            .attr("y", "160");

        percentile25.on("mouseover", () => tooltip25.style("display", "block"));
        percentile25.on("mouseout", () => tooltip25.style("display", "none"));

        const tooltip75 = svgBar.append("g").attr("class", "tooltip75").style("display", "none");

        tooltip75
            .append("rect")
            .attr("width", 170)
            .attr("height", 70)
            .attr("x", 160)
            .attr("y", 100)
            .attr("fill", "lightGray");

        tooltip75
            .append("text")
            .text(`Quartile-25: ${metrics["quartile 25"] ?? "-"}  Å`)
            .attr("x", "170")
            .attr("y", "120");

        tooltip75
            .append("text")
            .text(`Median: ${metrics["resolution Median"] ?? "-"}  Å`)
            .attr("x", "170")
            .attr("y", "140");

        tooltip75
            .append("text")
            .text(`Quartile-75: ${metrics["quartile 75"] ?? "-"}  Å`)
            .attr("x", "170")
            .attr("y", "160");

        percentile75.on("mouseover", () => tooltip75.style("display", "block"));
        percentile75.on("mouseout", () => tooltip75.style("display", "none"));

        const svgText = svg
            .append("g")
            .attr("transform", "translate(10, 170)")
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
    }, []);

    return svgRef;
}

interface GridData {
    color: string;
    height: number;
    width: number;
    value: number;
    x: number;
    y: number;
}
