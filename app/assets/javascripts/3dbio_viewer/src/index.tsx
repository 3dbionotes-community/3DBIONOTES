import React from "react";
import ReactGA from "react-ga";
import ReactDOM from "react-dom";
import reportWebVitals from "./reportWebVitals";
import App from "./webapp/pages/app/App";
import "./index.css";

const gaAppId = "UA-93698320-4"; //UA-93698320-4 for development UA-93698320-1 for production
ReactGA.initialize(gaAppId, {
    debug: process.env.NODE_ENV === "development",
    titleCase: false,
    useExistingGa: process.env.NODE_ENV !== "development",
});

ReactDOM.render(<App />, document.getElementById("root"));

reportWebVitals();
