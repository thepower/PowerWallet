const webpack = require('webpack');
const customizeСra = require('customize-cra');

function myOverrides(config, env) {
  config.resolve.fallback = {
    buffer: require.resolve('buffer'),
    crypto: require.resolve('crypto-browserify'),
    stream: require.resolve('stream-browserify'),
    util: require.resolve('util'),
    fs: false,
    path: false,
  };
  config.plugins.push(
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
  );

  config.experiments = {
    topLevelAwait: true,
  };

  return config;
}

module.exports = customizeСra.override(myOverrides, customizeСra.addExternalBabelPlugin(['@babel/plugin-syntax-import-attributes', { deprecatedAssertSyntax: true }]));
