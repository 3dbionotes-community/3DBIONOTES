const proxy = require("http-proxy-middleware");
const apicache = require("apicache");
const _ = require("lodash");

const routes = {
    pro: "https://3dbionotes.cnb.csic.es",
    dev: "http://rinchen-dos.cnb.csic.es:8882",
};

module.exports = function (app) {
    proxyRoutes(app, {
        routes: ["/3dbionotes"],
        target: routes.dev,
        rewritePath: true,
    });

    // Used by PPI Viewer
    proxyRoutes(app, {
        routes: ["/api"],
        target: routes.dev,
        cache: false,
        rewritePath: false,
    });

    // Used by PPI Viewer
    proxyRoutes(app, {
        routes: ["/assets"],
        target: routes.dev,
        rewritePath: false,
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

    proxyRoutes(app, {
        routes: ["/rinchen-dos"],
        target: routes.dev,
        rewritePath: true,
        cache: false,
    });
};

function proxyRoutes(app, options) {
    const { routes, target, rewritePath, cache = true } = options;
    const pathRewrite = rewritePath
        ? _.fromPairs(routes.map(route => [`^${route}/`, "/"]))
        : undefined;

    const proxyOptions = { target, changeOrigin: true, pathRewrite, logLevel: "debug" };
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
