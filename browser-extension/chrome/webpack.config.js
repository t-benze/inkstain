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
    // e.g. `config.plugins.push(new MyPlugin())`
    config.entry = {
      ...config.entry,
      content: {
        import: './src/scripts/content.ts',
        filename: 'scripts/content.js',
      },
    };
    config.output = {
      ...config.output,
      filename: '[name].js',
      chunkFilename: '[id].js',
    };
    return config;
  }
);
