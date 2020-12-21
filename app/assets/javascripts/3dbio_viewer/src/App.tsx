import React from "react";
import "./App.css";
import { MolecularStructure } from "./MolecularStructure";
import { ProtVistaTrack } from "./ProtVistaTrack";

function App() {
    return (
        <div id="app">
            <div id="left">{/*<MolecularStructure />*/}</div>

            <div id="right">
                <ProtVistaTrack />
            </div>
        </div>
    );
}

export default App;
