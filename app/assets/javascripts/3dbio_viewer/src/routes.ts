/* On DEV, proxy requests (to circumvent CORS) and cache them (see src/setupProxy.js) */

const isDev = process.env.NODE_ENV === "development";

export const routes = {
    bionotes: isDev ? "/3dbionotes" : "", // Use relative requests on 3dbionotes PRO
    ebi: isDev ? "/ebi" : "https://www.ebi.ac.uk",
    rinchen2: isDev ? "/rinchen-dos" : "http://rinchen-dos.cnb.csic.es:8882",
};
