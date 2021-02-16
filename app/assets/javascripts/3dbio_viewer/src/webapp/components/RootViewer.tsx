import React from "react";
import { Viewers } from "./viewers/Viewers";
import { MolecularStructure } from "./molecular-structure/MolecularStructure";
import { ViewerSelector } from "./viewer-selector/ViewerSelector";

export const RootViewer: React.FC = () => {
    return (
        <div id="viewer">
            <ViewerSelector />

            <div id="left">
                <MolecularStructure />
            </div>

            <div id="right">
                <Viewers />
            </div>
        </div>
    );
};
