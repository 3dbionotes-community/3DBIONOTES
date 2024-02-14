import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { ProtvistaGrouped } from "../../components/protvista/ProvistaGrouped";
import { RootViewer } from "../../components/RootViewer";

function AppRouter() {
    return (
        <Switch>
            <Route path="/protvista-all/:selection" render={() => <ProtvistaGrouped />} />
            <Route path="/uploaded/:token" render={() => <RootViewer from="uploaded" />} />
            <Route path="/network/:token" render={() => <RootViewer from="network" />} />
            <Route path="/:selection" render={() => <RootViewer from="selector" />} />
            <Route path="/">
                <Redirect to={`/${defaultPdbId}+${defaultEmdbId}`} />
            </Route>
        </Switch>
    );
}

export const defaultPdbId = "6zow";
export const defaultEmdbId = "EMD-11328";

export default React.memo(AppRouter);
