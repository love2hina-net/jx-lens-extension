import webpack from 'webpack';
import path from 'path';
import { Program } from 'typescript';
import TsMacros from 'ts-macros';

export const renderer: webpack.Configuration = {
  entry: './renderer.tsx',
  context: __dirname,
  target: 'electron-renderer',
  module: {
    rules: [
      {
        test: /\.tsx?$/i,
        use: [
          {
            loader: 'ts-loader',
            options: {
              getCustomTransformers: (p: Program) => ({ before: [TsMacros(p)] }),
            },
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.s?css$/i,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.svg$/i,
        type: 'asset/source',
      },
    ],
  },
  externals: [
    {
      '@k8slens/extensions': 'var global.LensExtensions',
      'react': 'var global.React',
      'react-router-dom': 'var global.ReactRouterDom',
      'mobx': 'var global.Mobx',
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
