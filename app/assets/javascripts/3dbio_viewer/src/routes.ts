/* On DEV, proxy requests (to circumvent CORS) and cache them (see src/setupProxy.js) */

export const isDev = process.env.NODE_ENV === "development";
const test = process.env.NODE_ENV === "test";

// If empty, use relative requests.
export const routes = {
    bionotes: isDev ? "/3dbionotes" : test ? "https://3dbionotes.cnb.csic.es" : "",
    bionotesStaging: isDev ? "/rinchen-dos" : test ? "https://3dbionotes.cnb.csic.es" : "",
    ebi: isDev ? "/ebi" : "https://www.ebi.ac.uk",
    uniprot: isDev ? "/uniprot" : "https://rest.uniprot.org",
};
