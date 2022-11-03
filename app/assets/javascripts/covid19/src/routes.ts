/* On DEV, proxy requests (to circumvent CORS) and cache them (see src/setupProxy.js) */

const isDev = process.env.NODE_ENV === "development";

export const routes = {
    bionotesApi: isDev
        ? "http://rinchen-dos.cnb.csic.es/bws/api"
        : "http://rinchen-dos.cnb.csic.es/bws/api", //change it on future when JR turns api to prod
};
