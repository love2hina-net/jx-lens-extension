const { electron, renderer } = require('./webpack.config.base.js');

module.exports = [
  Object.assign({}, electron, {
    mode: 'development',
    devtool: 'inline-source-map',
  }),
  Object.assign({}, renderer, {
    mode: 'development',
    devtool: 'inline-source-map',
  }),
];
