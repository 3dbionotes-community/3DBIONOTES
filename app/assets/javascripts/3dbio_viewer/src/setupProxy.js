const proxy = require("http-proxy-middleware");
const apicache = require("apicache");
const _ = require("lodash");

module.exports = function (app) {
    proxyRoutes(app, {
        routes: ["/3dbionotes"],
        target: "https://3dbionotes.cnb.csic.es",
        rewritePath: true,
    });

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
    });
};

function proxyRoutes(app, options) {
    const { routes, target, rewritePath } = options;
    const pathRewrite = rewritePath
        ? _.fromPairs(routes.map(route => [`^${route}/`, "/"]))
        : undefined;

    const proxyOptions = {
        target,
        changeOrigin: true,
        pathRewrite,
    };

    const apiProxy = proxy.createProxyMiddleware(proxyOptions);
    app.use(routes, apicache.middleware("1 day"), apiProxy);
}
