import React from "react";
import * as d3Module from "d3";
import { ProtvistaPdb, ProtvistaPdbProps } from "./ProtvistaPdb";

declare global {
    const d3: typeof d3Module;
}

export const ProtvistaPdbValidation: React.FC<ProtvistaPdbProps> = React.memo(props => {
    console.log("tracks", props.pdb.tracks);

    const svgRef = React.useRef<SVGSVGElement>(null);

    React.useEffect(() => {
        if (!svgRef.current) return;

        const svg = d3.select(svgRef.current);
        svg.append("circle").attr("cx", 140).attr("cy", 70).attr("r", 40).style("fill", "red");
        svg.append("circle").attr("cx", 300).attr("cy", 100).attr("r", 40).style("fill", "green");
    }, []);

    return (
        <>
            <h2>This is the custom ProtvistaPdbValidation component</h2>
            <svg ref={svgRef} width={5000} height={200} />
            <ProtvistaPdb {...props} />
        </>
    );
});
