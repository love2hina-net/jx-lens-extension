const path = require('path');

exports['electron'] = {
  entry: './main.ts',
  context: __dirname,
  target: 'electron-main',
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
      mobx: 'var global.Mobx',
      react: 'var global.React',
    },
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    libraryTarget: 'commonjs2',
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
};

exports['renderer'] = {
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
      mobx: 'var global.Mobx'
    }
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
    __filename: false
  }
};
