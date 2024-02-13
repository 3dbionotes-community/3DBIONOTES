/* On DEV, proxy requests (to circumvent CORS) and cache them (see src/setupProxy.js) */

const isDev = process.env.NODE_ENV === "development";

export const routes = {
    bionotesApi: isDev ? "http://3dbionotes.cnb.csic.es/bws/api" : `/bws/api`,
};
