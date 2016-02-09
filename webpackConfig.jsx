import webpack from 'webpack';

import babelConfig from './config/babel/browser';

const debug = true;
const devtool = 'eval';

export default {
  target: 'web',
  debug,
  devtool,
  module: {
    noParse: ['/^fb$/'],
    loaders: [
      {
        test: /\.json$/,
        exclude: /node_modules/,
        loader: 'json-loader',
      },
      {
        test: /\.js[x]?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          ignore: ['node_modules', 'dist'],
          plugins: babelConfig.plugins,
        },
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      },
    }),
    new webpack.ProvidePlugin({
      'Promise': 'bluebird',
    }),
    new webpack.optimize.DedupePlugin(),
    new webpack.IgnorePlugin(new RegExp('^(v8-profiler)$')),
  ],
  node: {
    console: true,
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
  },
  resolve: {
    extensions: ['', '.js', '.jsx'],
    alias: {
      'v8-natives': 'v8-natives/lib/v8-browser-all',
    },
  },
};
