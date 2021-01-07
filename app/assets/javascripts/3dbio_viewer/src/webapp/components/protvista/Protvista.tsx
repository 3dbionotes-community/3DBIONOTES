import React from "react";
import { useAppContext } from "../AppContext";
import { PdbProtvistaData } from "./provista.types";

interface ProvistaTrackElement extends HTMLDivElement {
    viewerdata: PdbProtvistaData;
}

export const Protvista: React.FC = () => {
    const inputEl = React.useRef<ProvistaTrackElement>(null);
    const { compositionRoot } = useAppContext();

    React.useEffect(() => {
        const el = inputEl.current;
        if (!el) return;

        compositionRoot.getPdb({ protein: "P0DTC2", pdb: "6zow", chain: "A" }).run(
            pdb => {
                //(el as any).variantFilter = protvistaConfig.variantsFilters;
                const viewerData: PdbProtvistaData = {
                    displayNavigation: true,
                    displaySequence: true,
                    displayConservation: false,
                    displayVariants: true,
                    ...pdb,
                };
                el.viewerdata = viewerData;
            },
            error => {
                alert(error.message);
            }
        );
    });

    return (
        <React.Fragment>
            <div>
                <protvista-pdb custom-data="true" ref={inputEl}></protvista-pdb>
            </div>
        </React.Fragment>
    );
    //return <ProtvistaTrackWrapper />;
};
