//import _ from "lodash";
import React from "react";
import ReactGA from "react-ga";
import ReactDOM from "react-dom";
import { App } from "./webapp/components/app/App";

const gaAppId = "UA-93698320-4";
ReactGA.initialize(gaAppId, {
    debug: true
  });
  
async function main() {
    ReactDOM.render(<App />, document.getElementById("root"));
}

main();
