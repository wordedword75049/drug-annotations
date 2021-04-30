const { merge } = require('webpack-merge');
const DotenvPlugin = require('dotenv-webpack');
const ErrorOverlayPlugin = require('error-overlay-webpack-plugin');
const common = require('./webpack.common');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'cheap-module-source-map',
  plugins: [new ErrorOverlayPlugin(), new DotenvPlugin()],
  devServer: {
    historyApiFallback: true,
    hot: true,
    port: '3000',
    stats: 'minimal',
    open: true,
    proxy: {
      '/local': {
        target: 'http://localhost:5000',
        pathRewrite: {
          '^/local': ''
        }
      },
    }
  }
});
