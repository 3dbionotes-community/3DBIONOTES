import React from "react";

declare const PDBeMolstarPlugin: any;

export const MolecularStructure: React.FC = () => {
    const inputEl = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const el = inputEl.current;
        if (el) {
            const initParams = {
                //moleculeId: "7d6h",
                moleculeId: "7kj5",
                //moleculeId: "5lnk",
                pdbeUrl: "https://www.ebi.ac.uk/pdbe/",
                loadMaps: true,
                validationAnnotation: true,
                hideControls: false,
                domainAnnotation: true,
                expanded: false,
                //bgColor: { r: 255, g: 255, b: 255 },
                subscribeEvents: false,
                assemblyId: "1", //'deposited' | "preferred"
            };

            const pdbeMolstar = new PDBeMolstarPlugin();
            pdbeMolstar.render(el, initParams);
        }
    });

    return (
        <div ref={inputEl} id="pdbe-molstar">
            Loading...
        </div>
    );
};
