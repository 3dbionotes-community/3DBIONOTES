/* On DEV, proxy requests (to circumvent CORS) and cache them (see src/setupProxy.js) */

export const isDev = process.env.NODE_ENV === "development";
const route = process.env.REACT_APP_BWS;

export const routes = {
    bionotesApi: isDev ? `${route}/api` : `/bws/api`,
};
