import React from "react";
import ReactGA from "react-ga";
import ReactDOM from "react-dom";
import { App } from "./webapp/components/app/App";

const gaAppId = "UA-93698320-4"; //UA-93698320-4 for development UA-93698320-1 for production
ReactGA.initialize(gaAppId, {
    debug: process.env.NODE_ENV === "development",
    titleCase: false,
    useExistingGa: process.env.NODE_ENV !== "development",
});

async function main() {
    ReactDOM.render(<App />, document.getElementById("root"));
}

main();
