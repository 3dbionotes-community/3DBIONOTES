import React from "react";
import { HashRouter, Route, Switch } from "react-router-dom";
import "./App.css";
import { MolecularStructure } from "./MolecularStructure";
import { AppContext } from "./webapp/components/AppContext";
import { Protvista } from "./webapp/components/protvista/Protvista";
import { Viewer } from "./webapp/components/Viewer";

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
                        <Viewer />
                    </Route>
                </Switch>
            </HashRouter>
        </AppContext>
    );
}

export default App;
