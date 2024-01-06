import webpack from 'webpack';
import { renderer } from './webpack.config.base';

const config: webpack.Configuration[] = [
  {
    mode: 'development',
    devtool: 'inline-source-map',
    ...renderer,
  },
];

export default config;
