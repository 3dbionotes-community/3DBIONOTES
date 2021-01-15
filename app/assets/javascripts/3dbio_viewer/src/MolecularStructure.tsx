import React from "react";
import { InitParams } from "pdbe-molstar/lib/spec";
import "molstar/lib/mol-plugin-ui/skin/light.scss";

declare const PDBeMolstarPlugin: any;

export const MolecularStructure: React.FC = () => {
    const inputEl = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const el = inputEl.current;
        if (el) {
            const initParams: InitParams = {
                moleculeId: "7kj5",
                //moleculeId: "7d6h",
                //moleculeId: "5lnk",
                pdbeUrl: "https://www.ebi.ac.uk/pdbe/",
                encoding: "cif",
                loadMaps: true,
                validationAnnotation: true,
                hideControls: true,
                domainAnnotation: true,
                expanded: false,
                bgColor: colors.white,
                subscribeEvents: false,
                assemblyId: "1",
                mapSettings: {},
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

const colors = {
    black: { r: 0, g: 0, b: 0 },
    white: { r: 255, g: 255, b: 255 },
};
