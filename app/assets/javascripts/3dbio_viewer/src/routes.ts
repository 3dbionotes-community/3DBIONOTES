/* On DEV, proxy requests (to circumvent CORS) and cache them (see src/setupProxy.js) */

const isDev = process.env.NODE_ENV === "development";

// If empty, use relative requests.
export const routes = {
    bionotes: isDev ? "/3dbionotes" : "",
    bionotesStaging: isDev ? "/rinchen-dos" : "",
    ebi: isDev ? "/ebi" : "https://www.ebi.ac.uk",
    uniprot: isDev ? "/uniprot" : "https://www.uniprot.org",
};
