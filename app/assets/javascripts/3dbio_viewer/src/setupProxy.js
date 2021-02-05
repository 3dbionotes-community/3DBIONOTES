const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
    const routes = ["/ppiIFrame", "/assets", "/cv19_annotations", "/ws", "/api"];
    const proxy = createProxyMiddleware({
        target: "http://3dbionotes.cnb.csic.es",
        changeOrigin: true,
    });

    app.use(routes, proxy);
};
