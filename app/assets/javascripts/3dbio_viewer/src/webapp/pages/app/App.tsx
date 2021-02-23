import React from "react";
import { HashRouter, Route, Switch } from "react-router-dom";

import { AppContext } from "../../../webapp/components/AppContext";
import { TrainingApp } from "../../../webapp/training-app";
import { modules } from "../../../webapp/training-app/training-modules";
import { ProtvistaViewer } from "../../components/protvista/ProtvistaViewer";
import { MolecularStructureRoute } from "../MolecularStructurePage";
import { RootViewerRoute } from "../RootViewerPage";

import "./App.css";

const showTraining = false;

function App() {
    return (
        <AppContext>
            <HashRouter>
                <Switch>
                    <MolecularStructureRoute path="/molstar/:selector" />
                    <Route path="/protvista" render={() => <ProtvistaViewer />} />
                    <RootViewerRoute path="/:selector" />
                    <RootViewerRoute path="/" />
                </Switch>
            </HashRouter>

            {showTraining && <TrainingApp locale="en" modules={modules} />}
        </AppContext>
    );
}

export default App;
