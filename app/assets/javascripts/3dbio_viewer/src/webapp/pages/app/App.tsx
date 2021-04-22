import React from "react";
import { HashRouter, Route, Switch } from "react-router-dom";

import { AppContext } from "../../../webapp/components/AppContext";
import { TrainingApp } from "../../../webapp/training-app";
import { modules } from "../../../webapp/training-app/training-modules";
import { ProtvistaGrouped } from "../../components/protvista/ProvistaGrouped";
import { Viewers } from "../../components/viewers/Viewers";
import { SelectionState } from "../../view-models/SelectionState";
import { MolecularStructureRoute } from "../MolecularStructurePage";
import { RootViewerRoute } from "../RootViewerPage";

import "./App.css";

const showTraining = true;

function App() {
    return (
        <AppContext>
            <HashRouter>
                <Switch>
                    <MolecularStructureRoute path="/molstar/:selector" />
                    <Route
                        path="/protvista"
                        render={() => <Viewers selection={protvistaSelection} />}
                    />
                    <Route
                        path="/protvista-all/:selector"
                        render={props => (
                            <ProtvistaGrouped selector={props.match.params.selector} />
                        )}
                    />
                    <RootViewerRoute path="/:selector" />
                    <RootViewerRoute path="/" />
                </Switch>
            </HashRouter>

            {showTraining && <TrainingApp locale="en" modules={modules} />}
        </AppContext>
    );
}

const protvistaSelection: SelectionState = {
    main: {
        pdb: { type: "pdb", id: "6zow", visible: true },
        emdb: { type: "emdb", id: "EMD-21375", visible: true },
    },
    overlay: [],
};

export default App;
