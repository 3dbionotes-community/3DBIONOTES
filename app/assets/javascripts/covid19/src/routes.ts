/* On DEV, proxy requests (to circumvent CORS) and cache them (see src/setupProxy.js) */

const isDev = process.env.NODE_ENV === "development";

export const routes = {
    bionotesApi: isDev
        ? "http://rinchen-dos.cnb.csic.es/bws/api"
        : "https://3dbionotes.cnb.csic.es/bws/api",
};
