const proxy = require("http-proxy-middleware");
const apicache = require("apicache");

module.exports = function (app) {
    proxyRoutes(app, {
        prefix: "3dbionotes",
        target: "https://3dbionotes.cnb.csic.es",
    });

    proxyRoutes(app, {
        prefix: "ebi",
        target: "https://www.ebi.ac.uk",
    });
};

function proxyRoutes(app, options) {
    const { prefix, target } = options;
    const routes = ["/" + prefix];
    const path = `^/${prefix}/`;

    const proxyOptions = {
        target,
        changeOrigin: true,
        pathRewrite: { [path]: "/" },
    };

    const apiProxy = proxy.createProxyMiddleware(proxyOptions);
    app.use(routes, apicache.middleware("1 day"), apiProxy);
}
