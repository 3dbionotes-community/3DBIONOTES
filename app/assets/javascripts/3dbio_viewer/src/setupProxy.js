const proxy = require("http-proxy-middleware");
const apicache = require("apicache");
const _ = require("lodash");

module.exports = function (app) {
    proxyRoutes(app, {
        routes: ["/3dbionotes"],
        target: "https://3dbionotes.cnb.csic.es",
        rewritePath: true,
    });

    // Use by PPI Viewer
    proxyRoutes(app, {
        routes: ["/api"],
        target: "https://3dbionotes.cnb.csic.es",
        cache: false,
        rewritePath: false,
    });

    // Use by PPI Viewer
    proxyRoutes(app, {
        routes: ["/assets"],
        target: "https://3dbionotes.cnb.csic.es",
        rewritePath: false,
    });

    proxyRoutes(app, {
        routes: ["/ebi"],
        target: "https://www.ebi.ac.uk",
        rewritePath: true,
    });

    proxyRoutes(app, {
        routes: ["/rinchen-dos"],
        target: "http://rinchen-dos.cnb.csic.es:8882",
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
        const cacheMidddleware = apicache.middleware("1 day");
        app.use(routes, cacheMidddleware, apiProxy);
    } else {
        app.use(routes, apiProxy);
    }
}
