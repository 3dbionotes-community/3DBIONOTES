/* On DEV, proxy requests (to circumvent CORS) and cache them (see src/setupProxy.js) */

const isDev = process.env.NODE_ENV === "development";
const _isOldViewer = true;

export const routes = {
    bionotesApi: isDev ? "http://rinchen-dos.cnb.csic.es/bws/api/" : "",
};
