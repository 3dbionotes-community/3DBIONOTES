const HttpsProxyAgent = require("https-proxy-agent");
const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
    const proxyServer = process.env.REACT_APP_HTTP_PROXY;

    const routes = ["/ppiIFrame", "/assets", "/cv19_annotations", "/ws", "/api"];
    const proxy = createProxyMiddleware({
        target: "https://3dbionotes.cnb.csic.es",
        changeOrigin: true,
        agent: proxyServer ? new HttpsProxyAgent(proxyServer) : undefined,
        onProxyReq,
    });

    app.use(routes, proxy);
};

function onProxyReq(proxyReq, req, res) {
    console.log(proxyReq, req, res);
}
