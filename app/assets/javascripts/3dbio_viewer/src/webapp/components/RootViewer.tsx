import React from "react";
import { MolecularStructure } from "./molecular-structure/MolecularStructure";
import { Protvista } from "./protvista/Protvista";

export const RootViewer: React.FC = () => {
    return (
        <div id="viewer">
            <div id="left">
                <MolecularStructure />
            </div>

            <div id="right">
                <Protvista />
            </div>
        </div>
    );
};
