/* On DEV, proxy requests (to circumvent CORS) and cache them (see src/setupProxy.js) */

const isDev = process.env.NODE_ENV === "development";

// If empty, use relative requests.
export const routes = {
    publicBionotesDev: isDev
        ? "http://rinchen-dos.cnb.csic.es/bws/"
        : "http://3dbionotes.cnb.csic.es/bws", //change for prod url
    bionotes: isDev ? "/3dbionotes" : "",
    bionotesDev: isDev ? "/rinchen-dos" : "",
    ebi: isDev ? "/ebi" : "https://www.ebi.ac.uk",
    uniprot: isDev ? "/uniprot" : "https://www.uniprot.org",
};
