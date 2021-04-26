import React from "react";
import { HashRouter, Route, Switch } from "react-router-dom";

import { AppContext } from "../../../webapp/components/AppContext";
import { TrainingApp } from "../../../webapp/training-app";
import { modules } from "../../../webapp/training-app/training-modules";
import { ProtvistaGrouped } from "../../components/protvista/ProvistaGrouped";
import { RootViewer } from "../../components/RootViewer";
import { MolecularStructurePage } from "../MolecularStructurePage";

import "./App.css";

const showTraining = true;

function App() {
    return (
        <AppContext>
            <HashRouter>
                <Switch>
                    <Route path="/molstar/:selector" render={() => <MolecularStructurePage />} />
                    <Route path="/protvista-all/:selection" render={() => <ProtvistaGrouped />} />

                    <Route path="/:selection/:profile" render={() => <RootViewer />} />
                    <Route path="/:selection" render={() => <RootViewer />} />
                    <Route path="/" render={() => <RootViewer />} />
                </Switch>
            </HashRouter>

            {showTraining && <TrainingApp locale="en" modules={modules} />}
        </AppContext>
    );
}

export default App;
