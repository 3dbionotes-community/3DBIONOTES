/* On DEV, proxy requests (to circumvent CORS) and cache them (see src/setupProxy.js) */

const isDev = process.env.NODE_ENV === "development";
const route = process.env.REACT_APP_BWS_HOST;

export const routes = {
    bionotesApi: isDev ? `http://${route}/api` : `/bws/api`,
};
