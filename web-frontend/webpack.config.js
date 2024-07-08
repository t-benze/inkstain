const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react');

// Nx plugins for webpack.
module.exports = composePlugins(
  withNx(),
  withReact({
    // Uncomment this line if you don't want to use SVGR
    // See: https://react-svgr.com/
    svgr: false,
  }),
  (config) => {
    // Update the webpack config as needed here.
    config.output.publicPath = '/static/';
    config.optimization.minimize = false;
    return config;
  }
);
