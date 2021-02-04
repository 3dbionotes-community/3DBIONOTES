import React from "react";
import { HashRouter, Route, Switch } from "react-router-dom";
import "./App.css";
import { MolecularStructure } from "../../../webapp/components/molecular-structure/MolecularStructure";
import { AppContext } from "../../../webapp/components/AppContext";
import { Protvista } from "../../../webapp/components/protvista/Protvista";
import { RootViewer } from "../../../webapp/components/RootViewer";
import { TrainingApp } from "../../../webapp/training-app";
import { modules } from "../../../webapp/training-app/training-modules";

function App() {
    return (
        <AppContext>
            <HashRouter>
                <Switch>
                    <Route path="/molstar">
                        <MolecularStructure />
                    </Route>

                    <Route path="/protvista">
                        <Protvista />
                    </Route>

                    <Route path="/">
                        <RootViewer />
                    </Route>
                </Switch>
            </HashRouter>
            {false && <TrainingApp locale="en" modules={modules} />}
        </AppContext>
    );
}

export default App;
