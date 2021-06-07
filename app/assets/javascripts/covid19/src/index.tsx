import _ from "lodash";
import React from "react";
import ReactDOM from "react-dom";
import { App } from "./webapp/components/app/App";

async function main() {
    ReactDOM.render(<App />, document.getElementById("root"));
}

main();
