import React from "react";
import ReactDOM from "react-dom";
import reportWebVitals from "./reportWebVitals";
import App from "./webapp/pages/app/App";
import "./index.css";
import { storageGarbageCollector } from "./data/storage-cache";


//Añadido
async function enableMocking() {
  // Solo se activa cuando estás desarrollando en local
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  const { worker } = await import('./mocks/browser');

  // bypass ignora las peticiones que no estén mockeadas (como imágenes o archivos .css)
  return worker.start({
    onUnhandledRequest: 'bypass',
  });
}

import { HomeSearch } from "./webapp/pages/home-search/HomeSearch";

enableMocking().then(() => {
    const appRoot = document.getElementById("root");
    const homeSearchRoot = document.getElementById("home-react-search-root");

    // Si estamos en la página del visor, montamos la app completa
    if (appRoot) {
        ReactDOM.render(<App />, appRoot);
    }

    // Si estamos en la página de inicio, montamos solo el buscador
    if (homeSearchRoot) {
        ReactDOM.render(<HomeSearch />, homeSearchRoot);
    }

    reportWebVitals();
    storageGarbageCollector();
});

/*enableMocking().then(() => {
  ReactDOM.render(<App />, document.getElementById("root"));

  reportWebVitals();
  storageGarbageCollector();
});*/