const path = require('path');
const config = require('@ucd-lib/cork-app-build').watch({
  root : path.resolve(__dirname, '..'),
  entry : 'cork-360-image-viewer.js',
  preview : 'demo',
  clientModules : 'node_modules'
});

module.exports = config;