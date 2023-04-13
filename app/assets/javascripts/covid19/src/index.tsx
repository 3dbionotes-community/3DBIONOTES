import React from "react";
import ReactDOM from "react-dom";
import { App } from "./webapp/components/app/App";

declare global {
    interface Window {
        gtag: (...args: any[]) => void;
        dataLayer: any[];
    }
}

const ga4 = process.env["REACT_APP_GOOGLE_ANALYTICS_4"];

function initGoogleAnalytics4(gaId: string) {
    (function (window: Window, document: Document, src: string) {
        (window.gtag =
            window.gtag ||
            function (...args) {
                (window.dataLayer = window.dataLayer || []).push(args);
            })("js", new Date());
        const a = document.createElement("script");
        a.async = true;
        a.src = src;
        document.head.prepend(a);
    })(window, document, `https://www.googletagmanager.com/gtag/js?id=${gaId}`);
    window.gtag("config", gaId);
}

async function main() {
    if (ga4) initGoogleAnalytics4(ga4);

    ReactDOM.render(<App />, document.getElementById("root"));
}

main();
