const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const devMode = process.env.NODE_ENV !== "production";

module.exports = {
  entry: './app/assets/javascripts/application.js',
  mode: devMode ? 'development' : 'production',
  output: {
    path: path.resolve(__dirname, './public/assets'),
    filename: 'application.js',
  },
  module: {
    rules: [
      {
        test: /\.(sa|sc|c)ss$/i,
        use: [
          devMode ? "style-loader" : MiniCssExtractPlugin.loader,
          "css-loader",
          "postcss-loader",
          "sass-loader",
        ],
      },
      // {
      //   test: /\.((c|sa|sc)ss)$/i,
      //   use: [
      //     "style-loader",
      //     {
      //       loader: "css-loader",
      //       options: {
      //         // Run `postcss-loader` on each CSS `@import` and CSS modules/ICSS imports, do not forget that `sass-loader` compile non CSS `@import`'s into a single file
      //         // If you need run `sass-loader` and `postcss-loader` on each CSS `@import` please set it to `2`
      //         importLoaders: 1,
      //       },
      //     },
      //     {
      //       loader: "postcss-loader",
      //       options: { plugins: () => [postcssPresetEnv({ stage: 0 })] },
      //     },
      //     {
      //       loader: "sass-loader",
      //     },
      //   ],
      // },
      {
        test: /\.(png|jpe?g|gif|svg|eot|ttf|woff|woff2)$/i,
        type: "asset",
      },
    ],
  },
  plugins: [].concat(devMode ? [] : [new MiniCssExtractPlugin()]),
};