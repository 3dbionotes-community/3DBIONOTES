import React from "react";
import { HashRouter, Redirect, Route, Switch } from "react-router-dom";

import { AppContext } from "../../../webapp/components/AppContext";
import { TrainingApp } from "../../../webapp/training-app";
import { modules } from "../../../webapp/training-app/training-modules";
import { ProtvistaGrouped } from "../../components/protvista/ProvistaGrouped";
import { RootViewer } from "../../components/RootViewer";

import "./App.css";

const showTraining = true;

function App() {
    return (
        <AppContext>
            <HashRouter>
                <Switch>
                    <Route path="/protvista-all/:selection" render={() => <ProtvistaGrouped />} />
                    <Route path="/uploaded/:token" render={() => <RootViewer from="uploaded" />} />
                    <Route path="/network/:token" render={() => <RootViewer from="network" />} />
                    <Route path="/:selection" render={() => <RootViewer from="selector" />} />
                    <Route path="/:selection" render={() => <RootViewer from="selector" />} />
                    <Route path="/">
                        <Redirect to="/6zow+EMD-21375" />
                    </Route>
                </Switch>
            </HashRouter>

            {showTraining && <TrainingApp locale="en" modules={modules} />}
        </AppContext>
    );
}

export default App;
