import { SnackbarProvider } from "d2-ui-components";
import React from "react";
import { HashRouter, Route, Switch } from "react-router-dom";
import "./App.css";
import { MolecularStructure } from "./MolecularStructure";
import { AppContext } from "./webapp/components/AppContext";
import { Protvista } from "./webapp/components/protvista/Protvista";
import { TrainingApp } from "./webapp/components/training-app/TrainingApp";
import { Viewer } from "./webapp/components/Viewer";
import { TrainingContextProvider } from "./webapp/contexts/training-context";

function App() {
    return (
        <AppContext>
            <TrainingContextProvider locale="en">
                <SnackbarProvider>
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
                    <TrainingApp />
                </SnackbarProvider>
            </TrainingContextProvider>
        </AppContext>
    );
}

export default App;
