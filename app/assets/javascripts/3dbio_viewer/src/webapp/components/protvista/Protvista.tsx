import React from "react";
import { useAppContext } from "../AppContext";
import { PdbProtvistaData } from "./provista.types";

interface ProvistaTrackElement extends HTMLDivElement {
    viewerdata: PdbProtvistaData;
}

export const Protvista: React.FC = () => {
    const protvistaElRef = React.useRef<ProvistaTrackElement>(null);
    const { compositionRoot } = useAppContext();

    React.useEffect(() => {
        const provistaEl = protvistaElRef.current;
        if (!provistaEl) return;

        compositionRoot.getPdb({ protein: "P0DTC2", pdb: "6zow", chain: "A" }).run(
            pdb => {
                //(provistaEl as any).variantFilter = protvistaConfig.variantsFilters;
                const viewerData: PdbProtvistaData = {
                    displayNavigation: true,
                    displaySequence: true,
                    displayConservation: false,
                    displayVariants: true,
                    ...pdb,
                };
                provistaEl.viewerdata = viewerData;
            },
            error => {
                alert(error.message);
            }
        );
    });

    return (
        <div>
            <protvista-pdb custom-data="true" ref={protvistaElRef}></protvista-pdb>
        </div>
    );
};
