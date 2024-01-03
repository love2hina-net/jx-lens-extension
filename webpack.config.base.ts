import webpack from 'webpack';
import path from 'path';

export const renderer: webpack.Configuration = {
  entry: './renderer.tsx',
  context: __dirname,
  target: 'electron-renderer',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  externals: [
    {
      '@k8slens/extensions': 'var global.LensExtensions',
      react: 'var global.React',
      'react-router-dom': 'var global.ReactRouterDom',
      mobx: 'var global.Mobx',
    },
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    libraryTarget: 'commonjs2',
    globalObject: 'this',
    filename: 'renderer.js',
    path: path.resolve(__dirname, 'dist'),
  },
  node: {
    __dirname: false,
    __filename: false,
  },
};
