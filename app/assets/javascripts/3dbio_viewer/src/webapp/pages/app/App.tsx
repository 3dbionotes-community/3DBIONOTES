import React from "react";
import { HashRouter, Redirect, Route, Switch, useLocation } from "react-router-dom";

import { AppContext } from "../../../webapp/components/AppContext";
import { TrainingApp } from "../../../webapp/training-app";
import { modules } from "../../../webapp/training-app/training-modules";
import { ProtvistaGrouped } from "../../components/protvista/ProvistaGrouped";
import { RootViewer } from "../../components/RootViewer";
import { sendAnalytics } from "../../utils/analytics";

import "./App.css";

const showTraining = true;

function App() {
    React.useEffect(() => {
        sendAnalytics({ type: "pageView", path: `/viewer/${window.location.hash}` });
    }, []);
    return (
        <AppContext>
            <HashRouter>
                <Switch>
                    <RouterTracking>
                        <Route
                            path="/protvista-all/:selection"
                            render={() => <ProtvistaGrouped />}
                        />
                        <Route
                            path="/uploaded/:token"
                            render={() => <RootViewer from="uploaded" />}
                        />
                        <Route
                            path="/network/:token"
                            render={() => <RootViewer from="network" />}
                        />
                        <Route path="/:selection" render={() => <RootViewer from="selector" />} />
                        <Route path="/:selection" render={() => <RootViewer from="selector" />} />
                        <Route path="/">
                            <Redirect to="/6zow+EMD-11328" />
                        </Route>
                    </RouterTracking>
                </Switch>
            </HashRouter>

            {showTraining && <TrainingApp locale="en" modules={modules} />}
        </AppContext>
    );
}

const RouterTracking: React.FC = props => {
    const location = useLocation();
    React.useEffect(() => {
        sendAnalytics({ type: "pageView", path: `/viewer${location.pathname}` });
    }, [location.pathname]);
    return <>{props.children}</>;
};

export default App;
