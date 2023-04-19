import React from "react";
import { HashRouter } from "react-router-dom";
import { AppContext } from "../../../webapp/components/AppContext";
import AppRouter from "./AppRouter";
import "./App.css";

function App() {
    return (
        <AppContext>
            <HashRouter>
                <AppRouter />
            </HashRouter>
        </AppContext>
    );
}

export default React.memo(App);
