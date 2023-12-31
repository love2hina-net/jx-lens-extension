const { electron, renderer } = require('./webpack.config.base.js');

module.exports = [ 
  Object.assign({}, electron, {
    mode: 'production',
  }),
  Object.assign({}, renderer, {
    mode: 'production',
  })
];
