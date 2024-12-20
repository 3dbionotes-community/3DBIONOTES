const proxy = require("http-proxy-middleware");
const apicache = require("apicache");
const _ = require("lodash");

const routes = {
    bws: process.env.REACT_APP_BWS || "https://3dbionotes.cnb.csic.es",
    bio: process.env.REACT_APP_3DBIO || "https://3dbionotes.cnb.csic.es",
};

module.exports = function (app) {
    proxyRoutes(app, {
        routes: ["/3dbionotes/bws"],
        target: routes.bws,
        rewritePath: true,
        cache: false,
    });

    proxyRoutes(app, {
        routes: ["/3dbionotes"],
        target: routes.bio,
        rewritePath: true,
        cache: false,
    });

    proxyRoutes(app, {
        routes: ["/ebi"],
        target: "https://www.ebi.ac.uk",
        rewritePath: true,
    });

    proxyRoutes(app, {
        routes: ["/uniprot"],
        target: "https://rest.uniprot.org",
        rewritePath: true,
    });
};

function proxyRoutes(app, options) {
    const { routes, target, rewritePath, cache = true } = options;
    const pathRewrite = rewritePath
        ? _.fromPairs(routes.map(route => [`^${route}/`, "/"]))
        : undefined;

    const proxyOptions = {
        target,
        changeOrigin: true,
        pathRewrite,
        logLevel: "debug",
        secure: false,
    };

    const apiProxy = proxy.createProxyMiddleware(proxyOptions);

    if (cache) {
        const cacheMidddleware = apicache
            .options({
                debug: true,
                statusCodes: {
                    include: [200, 404],
                },
            })
            .middleware("1 day");
        app.use(routes, cacheMidddleware, apiProxy);
    } else {
        app.use(routes, apiProxy);
    }
}
