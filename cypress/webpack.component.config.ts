import webpack from 'webpack';
import path from 'path';
import { WebpackManifestPlugin } from 'webpack-manifest-plugin';
const webpackConfig = {
  mode: 'development',
  context: path.resolve(__dirname, '../'),
  devtool: 'inline-source-map',
  resolve: {
    alias: {
      '~/web': path.resolve(__dirname, '../web-frontend/src'),
      '@inkstain/client-api': path.resolve(__dirname, '../lib/client-api/src'),
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react',
              '@babel/preset-typescript',
            ],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new webpack.ProvidePlugin({
      React: 'react',
    }),
    new WebpackManifestPlugin({}),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'fixtures'),
    },
  },
};

export default webpackConfig;
