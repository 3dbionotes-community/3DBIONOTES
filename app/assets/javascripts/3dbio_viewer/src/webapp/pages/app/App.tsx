import React from "react";
import { HashRouter, Route, Switch } from "react-router-dom";
import "./App.css";
import { MolecularStructure } from "../../../webapp/components/molecular-structure/MolecularStructure";
import { AppContext } from "../../../webapp/components/AppContext";
import { ProtvistaViewer } from "../../components/protvista/ProtvistaViewer";
import { RootViewer } from "../../../webapp/components/RootViewer";
import { TrainingApp } from "../../../webapp/training-app";
import { modules } from "../../../webapp/training-app/training-modules";
import { ViewerSelector } from "../../components/viewer-selector/ViewerSelector";
import { SelectionState } from "../../view-models/SelectionState";

function App() {
    return (
        <AppContext>
            <HashRouter>
                <Switch>
                    <Route
                        path="/molstar/:pdbId"
                        render={props => {
                            const options = { pdbId: props.match.params.pdbId };

                            return (
                                <div>
                                    <ViewerSelector selection={getSelection(options)} />
                                    <MolecularStructure selection={getSelection(options)} />
                                </div>
                            );
                        }}
                    />

                    <Route path="/protvista/(:pdbId)" render={_props => <ProtvistaViewer />} />

                    <Route
                        path="/:pdbId"
                        render={props => {
                            const options = { pdbId: props.match.params.pdbId };
                            return <RootViewer selection={getSelection(options)} />;
                        }}
                    />
                </Switch>
            </HashRouter>

            {false && <TrainingApp locale="en" modules={modules} />}
        </AppContext>
    );
}

function getSelection(options: { pdbId: string }): SelectionState {
    return {
        main: { pdbId: options.pdbId },
        overlay: [
            { type: "pdb", id: "1tqn", visible: true },
            /*
            { type: "pdb", id: "5er3", selected: true },
            { type: "emdb", id: "EMD-21375", selected: true },
            */
        ],
    };
}

export default App;
