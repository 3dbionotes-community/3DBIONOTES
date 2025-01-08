import React from "react";
import ReactDOM from "react-dom";
import reportWebVitals from "./reportWebVitals";
import App from "./webapp/pages/app/App";
import "./index.css";
import { storageGarbageCollector } from "./data/storage-cache";

ReactDOM.render(<App />, document.getElementById("root"));

reportWebVitals();
storageGarbageCollector();
