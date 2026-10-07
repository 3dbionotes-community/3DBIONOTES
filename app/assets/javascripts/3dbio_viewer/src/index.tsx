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

enableMocking().then(() => {
  ReactDOM.render(<App />, document.getElementById("root"));

  reportWebVitals();
  storageGarbageCollector();
});