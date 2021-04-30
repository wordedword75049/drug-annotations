/* eslint-disable import/no-extraneous-dependencies */
const path = require("path");
const { merge } = require('webpack-merge');
const common = require('./webpack.common');

module.exports = merge(common, {
  mode: 'production',
  output: {
    path: path.join(__dirname, "../build"),
    publicPath: "/drug-annotations",
    filename: "static/js/[name].[hash].js"
  }
});
