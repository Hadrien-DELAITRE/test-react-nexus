const should = require('should/as-function');
should(process.env.NODE_ENV).equalOneOf(['development', 'production', 'staging', 'testing']);

const babelConfig = require('./config/babel/node');

require('babel-register')(babelConfig);
require('babel-polyfill');
require('source-map-support').install();
require('./gulpfile.jsx');
