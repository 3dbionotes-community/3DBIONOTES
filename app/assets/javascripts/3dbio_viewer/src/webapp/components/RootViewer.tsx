import React from "react";
import { Viewers } from "./viewers/Viewers";
import { MolecularStructure } from "./molecular-structure/MolecularStructure";

export const RootViewer: React.FC = () => {
    return (
        <div id="viewer">
            <div id="left">
                <MolecularStructure />
            </div>

            <div id="right">
                <Viewers />
            </div>
        </div>
    );
};
